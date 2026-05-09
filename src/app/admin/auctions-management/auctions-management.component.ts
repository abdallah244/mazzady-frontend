import {
  Component,
  inject,
  computed,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

interface Auction {
  _id: string;
  productName: string;
  sellerId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    nickname: string;
  };
  startingPrice: number;
  minBidIncrement: number;
  mainImageUrl: string;
  additionalImagesUrl: string[];
  status: 'pending' | 'active' | 'ended';
  highestBid: number | null;
  highestBidderId?: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    nickname: string;
  };
  endDate: string;
  durationInSeconds: number;
  createdAt: string;
  isFeatured?: boolean;
  category?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

@Component({
  selector: 'app-auctions-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe],
  templateUrl: './auctions-management.component.html',
  styleUrl: './auctions-management.component.sass',
})
export class AuctionsManagementComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  isArabic = computed(() => this.translationService.isArabic());

  auctions = signal<Auction[]>([]);
  users = signal<User[]>([]);
  isLoading = signal(false);
  showAddModal = signal(false);
  showWinnerModal = signal(false);
  showEditModal = signal(false);
  selectedWinner: any = null;
  selectedAuction = signal<Auction | null>(null);
  currentPage = signal(0);
  itemsPerPage = 5;

  // Edit form data
  editMinBidIncrement = '';
  editEndTime = '';
  editProductName = '';
  editCategory = 'other';
  editIsFeatured = false;

  // Form data
  productName = '';
  sellerId = '';
  startingPrice = '';
  minBidIncrement = '1';
  endTime = '';
  isFeatured = false;
  category = 'other';
  mainImage: File | null = null;
  additionalImages: File[] = [];

  minDateTime: string = '';

  // Categories list (excluding 'all')
  categories = [
    'electronics',
    'fashion',
    'home',
    'vehicles',
    'art',
    'jewelry',
    'books',
    'sports',
    'other',
  ];

  paginatedAuctions = computed(() => {
    const start = this.currentPage() * this.itemsPerPage;
    return this.auctions().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.auctions().length / this.itemsPerPage));

  private timerInterval: any;

  getMinDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit() {
    this.loadAuctions();
    this.loadUsers();
    this.minDateTime = this.getMinDateTime();
    // Update timers every second
    this.timerInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  getTimeRemaining(endDate: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  }

  isAuctionEnded(endDate: string): boolean {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    return end <= now;
  }

  formatTimeRemaining(endDate: string): string {
    const time = this.getTimeRemaining(endDate);
    if (time.expired) {
      return this.isArabic() ? 'انتهى' : 'Expired';
    }
    if (time.days > 0) {
      return this.isArabic()
        ? `${time.days}يوم ${time.hours}س ${time.minutes}د`
        : `${time.days}d ${time.hours}h ${time.minutes}m`;
    }
    if (time.hours > 0) {
      return this.isArabic()
        ? `${time.hours}س ${time.minutes}د ${time.seconds}ث`
        : `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    }
    return this.isArabic()
      ? `${time.minutes}د ${time.seconds}ث`
      : `${time.minutes}m ${time.seconds}s`;
  }

  loadAuctions() {
    this.isLoading.set(true);
    const headers: { [key: string]: string } = {};
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .get<{
        auctions: Auction[];
        total: number;
        page: number;
        totalPages: number;
      }>(`${environment.apiUrl}/auctions`, { headers })
      .subscribe({
        next: (response) => {
          this.auctions.set(response.auctions || []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading auctions:', error);
          this.isLoading.set(false);
        },
      });
  }

  loadUsers() {
    const headers: { [key: string]: string } = {};
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http.get<User[]>(`${environment.apiUrl}/admin/users`, { headers }).subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
    });
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.resetForm();
  }

  resetForm() {
    this.productName = '';
    this.sellerId = '';
    this.startingPrice = '';
    this.minBidIncrement = '1';
    this.endTime = '';
    this.isFeatured = false;
    this.category = 'other';
    this.mainImage = null;
    this.additionalImages = [];
  }

  getUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName} (${user.email})`;
  }

  getCategoryName(category: string): string {
    const key = `auctions.categories.${category}` as any;
    return this.translationService.t(key);
  }

  onMainImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.mainImage = input.files[0];
    }
  }

  onAdditionalImagesSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.additionalImages = Array.from(input.files);
    }
  }

  submitAuction() {
    if (!this.productName || !this.sellerId || !this.startingPrice || !this.mainImage || !this.endTime) {
      alert(this.isArabic() ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const end = new Date(this.endTime);
    const now = new Date();
    const durationInSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);

    if (durationInSeconds < 300) {
      alert(this.isArabic() ? 'يجب أن يكون تاريخ الانتهاء بعد 5 دقائق على الأقل' : 'End time must be at least 5 minutes from now');
      return;
    }

    const formData = new FormData();
    formData.append('productName', this.productName);
    formData.append('sellerId', this.sellerId);
    formData.append('startingPrice', this.startingPrice);
    formData.append('minBidIncrement', this.minBidIncrement);
    formData.append('durationInSeconds', durationInSeconds.toString());
    formData.append('isFeatured', this.isFeatured.toString());
    formData.append('category', this.category);

    if (this.mainImage) {
      formData.append('images', this.mainImage);
    }

    this.additionalImages.forEach((img) => {
      formData.append('images', img);
    });

    const headers: { [key: string]: string } = {};
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http.post(`${environment.apiUrl}/auctions`, formData, { headers }).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadAuctions();
        alert(this.isArabic() ? 'تم إضافة المزاد بنجاح' : 'Auction added successfully');
      },
      error: (error) => {
        console.error('Error creating auction:', error);
        alert(this.isArabic() ? 'حدث خطأ أثناء إضافة المزاد' : 'Error creating auction');
      },
    });
  }

  deleteAuction(auction: Auction) {
    if (
      !confirm(
        this.isArabic()
          ? 'هل أنت متأكد من حذف هذا المزاد؟'
          : 'Are you sure you want to delete this auction?',
      )
    ) {
      return;
    }

    const headers: { [key: string]: string } = {};
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http.delete(`${environment.apiUrl}/auctions/${auction._id}`, { headers }).subscribe({
      next: () => {
        this.loadAuctions();
      },
      error: (error) => {
        console.error('Error deleting auction:', error);
        alert(this.isArabic() ? 'حدث خطأ أثناء حذف المزاد' : 'Error deleting auction');
      },
    });
  }

  getImageCount(auction: Auction): number {
    return 1 + (auction.additionalImagesUrl?.length || 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.isArabic() ? 'ar-EG' : 'en-US');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }

  viewWinnerDetails(auction: Auction) {
    if (!auction.highestBidderId) {
      alert(this.isArabic() ? 'لا يوجد فائز لهذا المزاد' : 'No winner for this auction');
      return;
    }
    this.selectedWinner = {
      auction: auction,
      winner: auction.highestBidderId,
      highestBid: auction.highestBid,
    };
    this.showWinnerModal.set(true);
  }

  closeWinnerModal() {
    this.showWinnerModal.set(false);
    this.selectedWinner = null;
  }

  openEditModal(auction: Auction) {
    // Only allow editing if no bids have been placed
    if (auction.highestBid !== null && auction.highestBid !== undefined) {
      alert(
        this.isArabic()
          ? 'لا يمكن تعديل المزاد بعد وجود مزايدات'
          : 'Cannot edit auction after bids have been placed',
      );
      return;
    }

    this.selectedAuction.set(auction);
    this.editMinBidIncrement = auction.minBidIncrement.toString();
    this.editProductName = auction.productName;
    this.editCategory = auction.category || 'other';
    this.editIsFeatured = auction.isFeatured || false;
    
    // Format endDate for datetime-local
    const end = new Date(auction.endDate);
    const year = end.getFullYear();
    const month = (end.getMonth() + 1).toString().padStart(2, '0');
    const day = end.getDate().toString().padStart(2, '0');
    const hours = end.getHours().toString().padStart(2, '0');
    const minutes = end.getMinutes().toString().padStart(2, '0');
    this.editEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedAuction.set(null);
    this.editMinBidIncrement = '';
    this.editEndTime = '';
    this.editProductName = '';
    this.editCategory = 'other';
    this.editIsFeatured = false;
  }

  updateAuctionSettings() {
    const auction = this.selectedAuction();
    if (!auction) return;

    const minBidIncrement = parseFloat(this.editMinBidIncrement);
    if (isNaN(minBidIncrement) || minBidIncrement < 1) {
      alert(
        this.isArabic()
          ? 'يجب أن يكون معدل الزيادة على الأقل 1'
          : 'Min bid increment must be at least 1',
      );
      return;
    }

    if (!this.editProductName.trim()) {
      alert(this.isArabic() ? 'يجب إدخال اسم المنتج' : 'Product name is required');
      return;
    }

    if (!this.editEndTime) {
      alert(this.isArabic() ? 'يجب اختيار تاريخ انتهاء المزاد' : 'End time is required');
      return;
    }

    const end = new Date(this.editEndTime);
    const now = new Date();
    const durationInSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);

    if (durationInSeconds < 300) {
      alert(this.isArabic() ? 'يجب أن يكون تاريخ الانتهاء بعد 5 دقائق على الأقل' : 'End time must be at least 5 minutes from now');
      return;
    }

    const headers: { [key: string]: string } = {};
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .put(
        `${environment.apiUrl}/auctions/${auction._id}/settings`,
        {
          minBidIncrement,
          durationInSeconds,
          productName: this.editProductName.trim(),
          category: this.editCategory,
          isFeatured: this.editIsFeatured,
        },
        { headers },
      )
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadAuctions();
          alert(
            this.isArabic()
              ? 'تم تحديث إعدادات المزاد بنجاح'
              : 'Auction settings updated successfully',
          );
        },
        error: (error) => {
          console.error('Error updating auction settings:', error);
          alert(
            error.error?.message ||
              (this.isArabic() ? 'حدث خطأ أثناء تحديث الإعدادات' : 'Error updating settings'),
          );
        },
      });
  }

  canEditAuction(auction: Auction): boolean {
    // Can edit if no bids have been placed and auction is pending
    return (
      auction.status === 'pending' ||
      auction.highestBid === null ||
      auction.highestBid === undefined
    );
  }

  activateAuction(auction: Auction) {
    if (auction.status !== 'pending') {
      alert(
        this.isArabic()
          ? 'يمكن تفعيل المزادات المعلقة فقط'
          : 'Only pending auctions can be activated',
      );
      return;
    }

    if (
      !confirm(
        this.isArabic()
          ? 'هل أنت متأكد من تفعيل هذا المزاد؟ سيبدأ المزاد فوراً'
          : 'Are you sure you want to activate this auction? The auction will start immediately',
      )
    ) {
      return;
    }

    const headers: { [key: string]: string } = {};
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .put(`${environment.apiUrl}/auctions/${auction._id}/activate`, {}, { headers })
      .subscribe({
        next: () => {
          this.loadAuctions();
          alert(this.isArabic() ? 'تم تفعيل المزاد بنجاح' : 'Auction activated successfully');
        },
        error: (error) => {
          console.error('Error activating auction:', error);
          alert(
            error.error?.message ||
              (this.isArabic() ? 'حدث خطأ أثناء تفعيل المزاد' : 'Error activating auction'),
          );
        },
      });
  }
}
