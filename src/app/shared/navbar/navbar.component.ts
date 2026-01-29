import {
  Component,
  inject,
  computed,
  signal,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.sass',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  mobileMenuOpen = signal(false);
  walletDropdownOpen = signal(false);
  paymentModalOpen = signal(false);
  paymentMethod = signal<'instapay' | null>(null);
  messagesDropdownOpen = signal(false);
  userMessages = signal<any[]>([]);

  isArabic = computed(() => this.translationService.isArabic());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Translations
  home = computed(() => this.translationService.t('navbar.home'));
  auctions = computed(() => this.translationService.t('navbar.auctions'));
  joinUs = computed(() => this.translationService.t('navbar.joinUs'));
  customerService = computed(() => this.translationService.t('navbar.customerService'));
  sellProduct = computed(() => this.translationService.t('navbar.sellProduct'));
  card = computed(() => this.translationService.t('navbar.card'));
  profile = computed(() => this.translationService.t('navbar.profile'));
  statistics = computed(() => this.translationService.t('navbar.statistics'));
  wallet = computed(() => this.translationService.t('navbar.wallet'));
  walletAddFunds = computed(() => this.translationService.t('navbar.walletAddFunds'));
  walletInstaPay = computed(() => this.translationService.t('navbar.walletInstaPay'));
  walletAmount = computed(() => this.translationService.t('navbar.walletAmount'));
  walletPhoneNumber = computed(() => this.translationService.t('navbar.walletPhoneNumber'));
  walletDepositImage = computed(() => this.translationService.t('navbar.walletDepositImage'));
  walletSubmitRequest = computed(() => this.translationService.t('navbar.walletSubmitRequest'));
  messagesLabel = computed(() => this.translationService.t('navbar.messages'));
  noMessages = computed(() => this.translationService.t('navbar.noMessages'));
  requestApproved = computed(() => this.translationService.t('navbar.requestApproved'));
  requestRejected = computed(() => this.translationService.t('navbar.requestRejected'));
  requestPending = computed(() => this.translationService.t('navbar.requestPending'));
  walletPrivacyPolicy = computed(() => this.translationService.t('navbar.walletPrivacyPolicy'));
  walletReviewingData = computed(() => this.translationService.t('navbar.walletReviewingData'));
  walletAddFundsSuccess = computed(() => this.translationService.t('navbar.walletAddFundsSuccess'));
  walletOK = computed(() => this.translationService.t('navbar.walletOK'));
  walletCancel = computed(() => this.translationService.t('navbar.walletCancel'));
  login = computed(() => this.translationService.t('navbar.login'));
  register = computed(() => this.translationService.t('navbar.register'));
  logout = computed(() => this.translationService.t('navbar.logout'));

  // Wallet balance (placeholder - will be fetched from backend later)
  walletBalance = signal(0);
  hasNewMessages = signal(false);
  notificationDismissed = signal(false);
  lastMessageCount = signal(0);
  private notificationTimeout: any = null;

  // Payment form
  paymentForm: FormGroup = this.fb.group({
    amount: ['', [Validators.required, Validators.min(1)]],
    depositImage: [null, [Validators.required]],
  });

  depositImagePreview: string | null = null;

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleWalletDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const wasOpen = this.walletDropdownOpen();
    this.walletDropdownOpen.update((value) => !value);

    // If opening the dropdown, refresh wallet balance
    if (!wasOpen && this.isAuthenticated()) {
      this.loadWalletBalance();
    }
  }

  closeWalletDropdown() {
    this.walletDropdownOpen.set(false);
  }

  openPaymentModal(method: 'instapay') {
    this.paymentMethod.set(method);
    this.paymentModalOpen.set(true);
    this.walletDropdownOpen.set(false);
  }

  toggleMessagesDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.messagesDropdownOpen.update((value) => !value);
  }

  closeMessagesDropdown() {
    this.messagesDropdownOpen.set(false);
  }

  dismissNotification() {
    this.hasNewMessages.set(false);
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
  }

  private showNotification() {
    // Reset dismissed state when showing new notification
    this.notificationDismissed.set(false);
    this.hasNewMessages.set(true);

    // Auto-hide after 10 seconds
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notificationTimeout = setTimeout(() => {
      this.hasNewMessages.set(false);
      this.notificationTimeout = null;
    }, 10000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (
      this.messagesDropdownOpen() &&
      !(event.target as HTMLElement).closest('.messages-container')
    ) {
      this.closeMessagesDropdown();
    }
    if (this.walletDropdownOpen() && !(event.target as HTMLElement).closest('.wallet-container')) {
      this.closeWalletDropdown();
    }
  }

  closePaymentModal() {
    this.paymentModalOpen.set(false);
    this.paymentMethod.set(null);
    this.paymentForm.reset();
    this.depositImagePreview = null;
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(this.isArabic() ? 'الرجاء اختيار ملف صورة' : 'Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(
          this.isArabic()
            ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت'
            : 'File size must be less than 5MB',
        );
        return;
      }
      this.paymentForm.patchValue({ depositImage: file });
      this.paymentForm.get('depositImage')?.markAsTouched();
      const reader = new FileReader();
      reader.onload = () => {
        this.depositImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.depositImagePreview = null;
    this.paymentForm.patchValue({ depositImage: null });
    this.paymentForm.get('depositImage')?.markAsUntouched();
    // Reset file input
    const fileInput = document.getElementById('depositImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmitPayment() {
    if (this.paymentForm.valid) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        alert(this.isArabic() ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('amount', this.paymentForm.get('amount')?.value);
      formData.append('phoneNumber', '01142402039');
      formData.append('depositImage', this.paymentForm.get('depositImage')?.value);
      formData.append('userId', currentUser.id);

      this.http.post(`${environment.apiUrl}/money-requests`, formData).subscribe({
        next: (response: unknown) => {
          this.closePaymentModal();
          alert(this.isArabic() ? 'تم إرسال الطلب بنجاح' : 'Request submitted successfully');
          this.loadMessages();
          // Reload wallet balance after submitting request
          this.loadWalletBalance();
        },
        error: () => {
          alert(this.isArabic() ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting request');
        },
      });
    }
  }

  ngOnInit() {
    if (this.isAuthenticated()) {
      this.loadWalletBalance();
      // Load messages first time without showing notification
      this.loadMessagesInitial();
      // Poll for new messages and wallet balance every 30 seconds
      this.pollingInterval = setInterval(() => {
        if (this.isAuthenticated()) {
          this.loadMessages();
          this.loadWalletBalance();
        }
      }, 30000);
    }
  }

  loadMessagesInitial() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/money-requests/user/${currentUser.id}`).subscribe({
      next: (requests) => {
        const depositMessages = requests
          .filter((req) => req.status === 'approved' || req.status === 'rejected')
          .map((req) => ({
            id: req._id,
            type: 'deposit',
            status: req.status,
            date: req.updatedAt,
            amount: req.amount,
            reviewNote: req.reviewNote,
            userName:
              req.userId?.firstName && req.userId?.lastName
                ? `${req.userId.firstName} ${req.userId.middleName || ''} ${req.userId.lastName}`.trim()
                : req.userId?.email || 'Unknown',
            userEmail: req.userId?.email || '',
            userPhone: req.phoneNumber || '',
            userProfileImage: req.userId?.profileImageUrl || null,
          }));

        this.http
          .get<any[]>(`${environment.apiUrl}/admin-messages/user/${currentUser.id}`)
          .subscribe({
            next: (adminMessages) => {
              const adminMessagesList = adminMessages.map((msg) => ({
                id: msg._id,
                type: 'admin',
                status: msg.read ? 'read' : 'unread',
                date: msg.createdAt,
                subject: msg.subject,
                message: msg.message,
                userName:
                  currentUser.firstName && currentUser.lastName
                    ? `${currentUser.firstName} ${currentUser.middleName || ''} ${currentUser.lastName}`.trim()
                    : currentUser.email || 'Unknown',
                userEmail: currentUser.email || '',
                userPhone: currentUser.phone || '',
                userProfileImage: currentUser.profileImageUrl || null,
              }));

              const allMessages = [...depositMessages, ...adminMessagesList].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              );

              // Set initial count without showing notification
              const unreadCount = allMessages.filter(
                (msg) =>
                  msg.status === 'unread' ||
                  (msg.type === 'deposit' &&
                    (msg.status === 'approved' || msg.status === 'rejected')),
              ).length;

              this.lastMessageCount.set(unreadCount);
              this.userMessages.set(allMessages);
            },
            error: () => {
              const allMessages = depositMessages.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              );
              const unreadCount = allMessages.filter(
                (msg) =>
                  msg.type === 'deposit' &&
                  (msg.status === 'approved' || msg.status === 'rejected'),
              ).length;
              this.lastMessageCount.set(unreadCount);
              this.userMessages.set(allMessages);
            },
          });
      },
      error: () => {},
    });
  }

  loadWalletBalance() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    this.http
      .get<{ walletBalance: number }>(`${environment.apiUrl}/auth/wallet-balance/${currentUser.id}`)
      .subscribe({
        next: (response) => {
          this.walletBalance.set(response.walletBalance || 0);
        },
        error: () => {
          // Silently handle wallet balance error
        },
      });
  }

  loadMessages() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/money-requests/user/${currentUser.id}`).subscribe({
      next: (requests) => {
        // Convert requests to messages format
        const depositMessages = requests
          .filter((req) => req.status === 'approved' || req.status === 'rejected')
          .map((req) => ({
            id: req._id,
            type: 'deposit',
            status: req.status,
            date: req.updatedAt,
            amount: req.amount,
            reviewNote: req.reviewNote,
            // User data from the request
            userName:
              req.userId?.firstName && req.userId?.lastName
                ? `${req.userId.firstName} ${req.userId.middleName || ''} ${req.userId.lastName}`.trim()
                : req.userId?.email || 'Unknown',
            userEmail: req.userId?.email || '',
            userPhone: req.phoneNumber || '',
            userProfileImage: req.userId?.profileImageUrl || null,
          }));

        // Load admin messages
        this.http
          .get<any[]>(`${environment.apiUrl}/admin-messages/user/${currentUser.id}`)
          .subscribe({
            next: (adminMessages) => {
              const adminMessagesList = adminMessages.map((msg) => ({
                id: msg._id,
                type: 'admin',
                status: msg.read ? 'read' : 'unread',
                date: msg.createdAt,
                subject: msg.subject,
                message: msg.message,
                userName:
                  currentUser.firstName && currentUser.lastName
                    ? `${currentUser.firstName} ${currentUser.middleName || ''} ${currentUser.lastName}`.trim()
                    : currentUser.email || 'Unknown',
                userEmail: currentUser.email || '',
                userPhone: currentUser.phone || '',
                userProfileImage: currentUser.profileImageUrl || null,
              }));

              // Combine and sort all messages
              const allMessages = [...depositMessages, ...adminMessagesList].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              );

              // Count unread/new messages
              const unreadCount = allMessages.filter(
                (msg) =>
                  msg.status === 'unread' ||
                  (msg.type === 'deposit' &&
                    (msg.status === 'approved' || msg.status === 'rejected')),
              ).length;

              // Check if there are NEW messages (count increased)
              const lastCount = this.lastMessageCount();
              if (unreadCount > lastCount && lastCount > 0) {
                // New messages arrived - show notification
                this.showNotification();
              }

              // Update last count
              this.lastMessageCount.set(unreadCount);
              this.userMessages.set(allMessages);
            },
            error: () => {
              // Even if admin messages fail, check for new deposit messages
              const allMessages = depositMessages.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              );
              const unreadCount = allMessages.filter(
                (msg) =>
                  msg.type === 'deposit' &&
                  (msg.status === 'approved' || msg.status === 'rejected'),
              ).length;

              const lastCount = this.lastMessageCount();
              if (unreadCount > lastCount && lastCount > 0) {
                this.showNotification();
              }

              this.lastMessageCount.set(unreadCount);
              this.userMessages.set(allMessages);
            },
          });
      },
      error: () => {
        // Silently handle messages error
      },
    });
  }

  ngOnDestroy() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
