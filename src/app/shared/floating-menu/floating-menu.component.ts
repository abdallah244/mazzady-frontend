import { Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { ThemeService, ColorScheme } from '../../core/theme.service';
import { AuthService } from '../../auth/auth.service';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { AssetUrlPipe } from '../pipes/asset-url.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-floating-menu',
  imports: [CommonModule, FormsModule, ChatbotComponent, AssetUrlPipe],
  templateUrl: './floating-menu.component.html',
  styleUrl: './floating-menu.component.sass',
})
export class FloatingMenuComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  isOpen = signal(false);
  chatbotOpen = signal(false);
  isSchemeDropdownOpen = signal(false);
  isThemeDropdownOpen = signal(false);

  // Modal states
  quickReferenceModalOpen = signal(false);
  copyrightModalOpen = signal(false);
  sitePolicyModalOpen = signal(false);
  returnPolicyModalOpen = signal(false);
  privacyPolicyModalOpen = signal(false);
  messagesModalOpen = signal(false);

  // Messages
  userMessages = signal<any[]>([]);
  private messagesInterval: any = null;

  // Translations
  chatBot = computed(() => this.translationService.t('menu.chatBot'));
  privacyPolicy = computed(() => this.translationService.t('menu.privacyPolicy'));
  returnPolicy = computed(() => this.translationService.t('menu.returnPolicy'));
  sitePolicy = computed(() => this.translationService.t('menu.sitePolicy'));
  copyright = computed(() => this.translationService.t('menu.copyright'));
  quickReference = computed(() => this.translationService.t('menu.quickReference'));
  quickReferenceContent = computed(() => this.translationService.t('menu.quickReferenceContent'));
  copyrightContent = computed(() => this.translationService.t('menu.copyrightContent'));
  sitePolicyContent = computed(() => this.translationService.t('menu.sitePolicyContent'));
  returnPolicyContent = computed(() => this.translationService.t('menu.returnPolicyContent'));
  privacyPolicyContent = computed(() => this.translationService.t('menu.privacyPolicyContent'));
  close = computed(() => this.translationService.t('menu.close'));
  changeLanguage = computed(() => this.translationService.t('menu.changeLanguage'));
  changeTheme = computed(() => this.translationService.t('menu.changeTheme'));
  themePersistent = computed(() => this.translationService.t('menu.themePersistent'));
  themeDark = computed(() => this.translationService.t('menu.themeDark'));
  themeLight = computed(() => this.translationService.t('menu.themeLight'));
  changeScheme = computed(() => this.translationService.t('menu.changeScheme'));
  schemeDefault = computed(() => this.translationService.t('menu.schemeDefault'));
  schemeBasic = computed(() => this.translationService.t('menu.schemeBasic'));
  messages = computed(() => this.translationService.t('menu.messages'));
  noMessages = computed(() => this.translationService.t('menu.noMessages'));
  requestApproved = computed(() => this.translationService.t('menu.requestApproved'));
  requestRejected = computed(() => this.translationService.t('menu.requestRejected'));
  requestPending = computed(() => this.translationService.t('menu.requestPending'));
  amount = computed(() => this.translationService.t('menu.amount'));
  date = computed(() => this.translationService.t('menu.date'));
  delete = computed(() => this.translationService.t('menu.delete'));

  getCategoryLabel(category: string): string {
    const categoryKey = `joinUs.${category}`;
    return this.translationService.t(categoryKey as any);
  }

  currentLanguage = computed(() => this.translationService.language());
  currentTheme = computed(() => this.themeService.theme());
  currentScheme = computed(() => this.themeService.scheme());
  isPersistent = computed(() => this.themeService.persistent());
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isArabic = computed(() => this.translationService.isArabic());

  toggleMenu() {
    this.isOpen.set(!this.isOpen());
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  onChatBot() {
    this.chatbotOpen.set(true);
    this.closeMenu();
  }

  onPrivacyPolicy() {
    this.privacyPolicyModalOpen.set(true);
    this.closeMenu();
  }

  onReturnPolicy() {
    this.returnPolicyModalOpen.set(true);
    this.closeMenu();
  }

  onSitePolicy() {
    this.sitePolicyModalOpen.set(true);
    this.closeMenu();
  }

  onCopyright() {
    this.copyrightModalOpen.set(true);
    this.closeMenu();
  }

  onQuickReference() {
    this.quickReferenceModalOpen.set(true);
    this.closeMenu();
  }

  closeQuickReferenceModal() {
    this.quickReferenceModalOpen.set(false);
  }

  closeCopyrightModal() {
    this.copyrightModalOpen.set(false);
  }

  closeSitePolicyModal() {
    this.sitePolicyModalOpen.set(false);
  }

  closeReturnPolicyModal() {
    this.returnPolicyModalOpen.set(false);
  }

  closePrivacyPolicyModal() {
    this.privacyPolicyModalOpen.set(false);
  }

  onLanguageChange() {
    this.translationService.toggleLanguage();
    this.closeMenu();
  }

  toggleThemeDropdown() {
    this.isThemeDropdownOpen.set(!this.isThemeDropdownOpen());
  }

  closeThemeDropdown() {
    this.isThemeDropdownOpen.set(false);
  }

  onThemeSelect(theme: 'dark' | 'light') {
    this.themeService.setTheme(theme);
    this.closeThemeDropdown();
  }

  onPersistentChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.themeService.setPersistent(target.checked);
  }

  toggleSchemeDropdown() {
    this.isSchemeDropdownOpen.set(!this.isSchemeDropdownOpen());
  }

  closeSchemeDropdown() {
    this.isSchemeDropdownOpen.set(false);
  }

  onSchemeSelect(scheme: ColorScheme) {
    this.themeService.setScheme(scheme);
    this.closeSchemeDropdown();
  }

  getSchemeName(scheme: string): string {
    switch (scheme) {
      case 'default':
        return this.schemeDefault();
      case 'basic':
        return this.schemeBasic();
      default:
        return this.schemeDefault();
    }
  }

  onMessages() {
    this.messagesModalOpen.set(true);
    this.closeMenu();
    if (this.isAuthenticated()) {
      this.loadMessages();
    }
  }

  closeMessagesModal() {
    this.messagesModalOpen.set(false);
  }

  ngOnInit() {
    if (this.isAuthenticated()) {
      this.loadMessages();
      // Poll for new messages every 30 seconds
      this.messagesInterval = setInterval(() => {
        if (this.isAuthenticated()) {
          this.loadMessages();
        }
      }, 30000);
    }
  }

  ngOnDestroy() {
    if (this.messagesInterval) {
      clearInterval(this.messagesInterval);
    }
  }

  loadMessages() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    // Load deposit messages
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

        // Load customer support messages
        this.http
          .get<any[]>(`${environment.apiUrl}/customer-support/user/${currentUser.id}`)
          .subscribe({
            next: (tickets) => {
              const supportMessages = tickets
                .filter((ticket) => ticket.adminResponse)
                .map((ticket) => ({
                  id: ticket._id,
                  type: 'support',
                  status: ticket.status,
                  date: ticket.respondedAt || ticket.updatedAt,
                  category: ticket.category,
                  subject: ticket.subject,
                  message: ticket.message,
                  adminResponse: ticket.adminResponse,
                  userName:
                    ticket.userId?.firstName && ticket.userId?.lastName
                      ? `${ticket.userId.firstName} ${ticket.userId.middleName || ''} ${ticket.userId.lastName}`.trim()
                      : ticket.userId?.email || 'Unknown',
                  userEmail: ticket.userId?.email || '',
                  userPhone: ticket.userId?.phone || '',
                  userProfileImage: ticket.userId?.profileImageUrl || null,
                }));

              // Load auction product messages
              this.http
                .get<any[]>(`${environment.apiUrl}/auction-products/user/${currentUser.id}`)
                .subscribe({
                  next: (products) => {
                    const productMessages = products
                      .filter(
                        (product) => product.status === 'approved' || product.status === 'rejected',
                      )
                      .map((product) => ({
                        id: product._id,
                        type: 'product',
                        status: product.status,
                        date: product.reviewedAt || product.updatedAt,
                        startingPrice: product.startingPrice,
                        adminNote: product.adminNote,
                        userName:
                          currentUser.firstName && currentUser.lastName
                            ? `${currentUser.firstName} ${currentUser.middleName || ''} ${currentUser.lastName}`.trim()
                            : currentUser.email || 'Unknown',
                        userEmail: currentUser.email || '',
                        userPhone: currentUser.phone || '',
                        userProfileImage: currentUser.profileImageUrl || null,
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
                          const allMessages = [
                            ...depositMessages,
                            ...supportMessages,
                            ...productMessages,
                            ...adminMessagesList,
                          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                          this.userMessages.set(allMessages);
                        },
                        error: () => {
                          // Even if admin messages fail, show other messages
                          const allMessages = [
                            ...depositMessages,
                            ...supportMessages,
                            ...productMessages,
                          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          this.userMessages.set(allMessages);
                        },
                      });
                  },
                  error: () => {
                    // If product messages fail, still show other messages
                    const allMessages = [...depositMessages, ...supportMessages].sort(
                      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                    );
                    this.userMessages.set(allMessages);
                  },
                });
            },
            error: () => {
              // If support messages fail, still show deposit messages
              this.userMessages.set(
                depositMessages.sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                ),
              );
            },
          });
      },
      error: () => {
        // Silently handle error
      },
    });
  }

  getStatusText(status: string, type: string = 'deposit'): string {
    if (type === 'admin') {
      if (status === 'read') {
        return this.isArabic() ? 'مقروء' : 'Read';
      } else {
        return this.isArabic() ? 'غير مقروء' : 'Unread';
      }
    }
    if (type === 'job') {
      if (status === 'accepted') {
        return this.isArabic() ? 'تم القبول' : 'Accepted';
      } else if (status === 'rejected') {
        return this.isArabic() ? 'تم الرفض' : 'Rejected';
      }
    }
    if (status === 'approved') {
      return this.requestApproved();
    } else if (status === 'rejected') {
      return this.requestRejected();
    } else if (status === 'resolved') {
      return this.isArabic() ? 'تم الحل' : 'Resolved';
    } else if (status === 'closed') {
      return this.isArabic() ? 'مغلق' : 'Closed';
    } else if (status === 'in_progress') {
      return this.isArabic() ? 'قيد المعالجة' : 'In Progress';
    } else {
      return this.requestPending();
    }
  }

  getStatusClass(status: string, type: string = 'deposit'): string {
    if (type === 'product') {
      if (status === 'approved') {
        return 'status-approved';
      } else if (status === 'rejected') {
        return 'status-rejected';
      }
    }
    if (status === 'approved') {
      return 'status-approved';
    } else if (status === 'rejected') {
      return 'status-rejected';
    } else if (status === 'resolved') {
      return 'status-resolved';
    } else if (status === 'closed') {
      return 'status-closed';
    } else if (status === 'in_progress') {
      return 'status-in-progress';
    } else {
      return 'status-pending';
    }
  }

  deleteMessage(messageId: string, messageType: string = 'deposit'): void {
    const confirmMessage = this.isArabic()
      ? 'هل أنت متأكد من حذف هذه الرسالة؟'
      : 'Are you sure you want to delete this message?';

    if (confirm(confirmMessage)) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Delete request from database
      let endpoint = '';
      if (messageType === 'support') {
        endpoint = `${environment.apiUrl}/customer-support/user/${currentUser.id}/${messageId}`;
      } else if (messageType === 'product') {
        endpoint = `${environment.apiUrl}/auction-products/user/${currentUser.id}/${messageId}`;
      } else if (messageType === 'admin') {
        endpoint = `${environment.apiUrl}/admin-messages/user/${currentUser.id}/${messageId}`;
      } else {
        endpoint = `${environment.apiUrl}/money-requests/user/${currentUser.id}/${messageId}`;
      }

      this.http.delete(endpoint).subscribe({
        next: () => {
          // Remove message from the list
          this.userMessages.update((messages) => messages.filter((msg) => msg.id !== messageId));

          // Show success message
          if (this.isArabic()) {
            alert('تم حذف الرسالة بنجاح');
          } else {
            alert('Message deleted successfully');
          }
        },
        error: (error) => {
          let errorMessage = this.isArabic()
            ? 'حدث خطأ أثناء حذف الرسالة'
            : 'Error deleting message';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          alert(errorMessage);
        },
      });
    }
  }
}
