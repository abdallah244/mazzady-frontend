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
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { ThemeService } from '../core/theme.service';
import { HttpClient } from '@angular/common/http';
import { SellerService } from '../core/seller.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { AssetUrlPipe } from '../shared/pipes/asset-url.pipe';

interface AuctionProduct {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  mainImageUrl: string;
  additionalImagesUrl?: string[];
  startingPrice: number;
  currentBid?: number;
  category?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'ended';
  createdAt: string;
  endDate?: string;
  sellerLikesCount?: number; // عدد القلوب للبائع
}

interface Seller {
  sellerId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  totalAuctions: number;
  likesCount: number;
  averageRating: number;
  totalRatings: number;
}

@Component({
  selector: 'app-auctions',
  imports: [CommonModule, FormsModule, AssetUrlPipe],
  templateUrl: './auctions.component.html',
  styleUrl: './auctions.component.sass',
})
export class AuctionsComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private sellerService = inject(SellerService);
  private authService = inject(AuthService);

  isArabic = computed(() => this.translationService.isArabic());
  currentTheme = computed(() => this.themeService.theme());
  currentUser = computed(() => this.authService.getCurrentUser());

  // Search and Filter
  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  priceRangeMin = signal(0);
  priceRangeMax = signal(1000000);
  sortBy = signal<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
  showFilters = signal(false);

  // Getters for two-way binding
  get searchQueryValue(): string {
    return this.searchQuery();
  }
  set searchQueryValue(value: string) {
    this.searchQuery.set(value);
  }

  get selectedCategoryValue(): string {
    return this.selectedCategory();
  }
  set selectedCategoryValue(value: string) {
    this.selectedCategory.set(value);
  }

  get priceRangeMinValue(): number {
    return this.priceRangeMin();
  }
  set priceRangeMinValue(value: number) {
    this.priceRangeMin.set(value);
  }

  get priceRangeMaxValue(): number {
    return this.priceRangeMax();
  }
  set priceRangeMaxValue(value: number) {
    this.priceRangeMax.set(value);
  }

  get sortByValue(): 'newest' | 'oldest' | 'price-low' | 'price-high' {
    return this.sortBy();
  }
  set sortByValue(value: 'newest' | 'oldest' | 'price-low' | 'price-high') {
    this.sortBy.set(value);
  }

  // Products
  allProducts = signal<AuctionProduct[]>([]);
  filteredProducts = computed(() => {
    let products = [...this.allProducts()];

    // Filter by status (only active/approved)
    products = products.filter((p) => p.status === 'approved' || p.status === 'active');

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      products = products.filter((p) => {
        const userName = `${p.userId.firstName} ${p.userId.lastName}`.toLowerCase();
        return (
          userName.includes(query) ||
          p.userId.email.toLowerCase().includes(query) ||
          (p.category && p.category.toLowerCase().includes(query))
        );
      });
    }

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      products = products.filter((p) => p.category === this.selectedCategory());
    }

    // Filter by price range
    products = products.filter((p) => {
      const price = p.currentBid || p.startingPrice;
      return price >= this.priceRangeMin() && price <= this.priceRangeMax();
    });

    // Sort
    const sort = this.sortBy();
    products.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-low':
          return (a.currentBid || a.startingPrice) - (b.currentBid || b.startingPrice);
        case 'price-high':
          return (b.currentBid || b.startingPrice) - (a.currentBid || a.startingPrice);
        default:
          return 0;
      }
    });

    return products;
  });

  // Categories
  categories = signal<string[]>([
    'all',
    'electronics',
    'fashion',
    'home',
    'vehicles',
    'art',
    'jewelry',
    'books',
    'sports',
    'other',
  ]);

  // Translations
  title = computed(() => this.translationService.t('auctions.title'));
  searchPlaceholder = computed(() => this.translationService.t('auctions.searchPlaceholder'));
  categoryLabel = computed(() => this.translationService.t('auctions.category'));
  allCategories = computed(() => this.translationService.t('auctions.allCategories'));
  filters = computed(() => this.translationService.t('auctions.filters'));
  priceRangeLabel = computed(() => this.translationService.t('auctions.priceRange'));
  sortByLabel = computed(() => this.translationService.t('auctions.sortBy'));
  newest = computed(() => this.translationService.t('auctions.newest'));
  oldest = computed(() => this.translationService.t('auctions.oldest'));
  priceLowToHigh = computed(() => this.translationService.t('auctions.priceLowToHigh'));
  priceHighToLow = computed(() => this.translationService.t('auctions.priceHighToLow'));
  noProducts = computed(() => this.translationService.t('auctions.noProducts'));
  startingPriceLabel = computed(() => this.translationService.t('auctions.startingPrice'));
  currentBidLabel = computed(() => this.translationService.t('auctions.currentBid'));
  viewDetails = computed(() => this.translationService.t('auctions.viewDetails'));
  applyFilters = computed(() => this.translationService.t('auctions.applyFilters'));
  clearFilters = computed(() => this.translationService.t('auctions.clearFilters'));
  closeFilters = computed(() => this.translationService.t('auctions.closeFilters'));
  loadingText = computed(() => this.translationService.t('common.loading'));
  sellersButton = computed(() => this.translationService.t('auctions.sellers'));
  sellersModalTitle = computed(() => this.translationService.t('auctions.sellersModal.title'));
  sellersModalTotalAuctions = computed(() =>
    this.translationService.t('auctions.sellersModal.totalAuctions'),
  );
  sellersModalLikes = computed(() => this.translationService.t('auctions.sellersModal.likes'));
  sellersModalRating = computed(() => this.translationService.t('auctions.sellersModal.rating'));
  sellersModalNoSellers = computed(() =>
    this.translationService.t('auctions.sellersModal.noSellers'),
  );
  sellersModalClose = computed(() => this.translationService.t('auctions.sellersModal.close'));

  loading = signal(false);

  // Sellers Modal
  showSellersModal = signal(false);
  sellers = signal<Seller[]>([]);
  sellersLoading = signal(false);
  sellerLikesMap = signal<Map<string, number>>(new Map()); // Map<sellerId, likesCount>
  sellerLikedByUser = signal<Set<string>>(new Set()); // Set of sellerIds that current user liked
  likingInProgress = signal<Set<string>>(new Set()); // Set of sellerIds being toggled

  private timerInterval: any;
  private sellerUpdatesSubscription?: Subscription;

  ngOnInit() {
    this.loadProducts();
    this.loadSellersLikes();

    // Subscribe to seller like updates
    this.sellerUpdatesSubscription = this.sellerService.sellerUpdates$.subscribe((update) => {
      // Update likes map
      this.sellerLikesMap.update((map) => {
        const newMap = new Map(map);
        newMap.set(update.sellerId, update.likesCount);
        return newMap;
      });

      // Update sellers list if modal is open
      this.sellers.update((sellers) => {
        return sellers.map((seller) =>
          seller.sellerId === update.sellerId
            ? { ...seller, likesCount: update.likesCount }
            : seller,
        );
      });

      // Update products with seller likes
      this.allProducts.update((products) => {
        return products.map((product) =>
          product.userId._id === update.sellerId
            ? { ...product, sellerLikesCount: update.likesCount }
            : product,
        );
      });
    });

    // Update timers every second
    this.timerInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.sellerUpdatesSubscription) {
      this.sellerUpdatesSubscription.unsubscribe();
    }
  }

  getTimeRemaining(endDate: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } {
    if (!endDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
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

  formatTimeRemaining(endDate?: string): string {
    if (!endDate) {
      return this.isArabic() ? 'انتهى' : 'Expired';
    }
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

  loadProducts() {
    this.loading.set(true);
    this.http
      .get<{ auctions: any[]; total: number }>(`${environment.apiUrl}/auctions/active`)
      .subscribe({
        next: (response) => {
          // Transform API response to match interface
          const products = response.auctions || [];
          const transformed: AuctionProduct[] = products.map((p: any) => ({
            _id: p._id,
            userId: p.sellerId,
            mainImageUrl: p.mainImageUrl,
            additionalImagesUrl: p.additionalImagesUrl || [],
            startingPrice: p.startingPrice,
            currentBid: p.highestBid || null,
            category: p.category || 'other',
            status: (p.status === 'active' ? 'approved' : 'rejected') as
              | 'pending'
              | 'approved'
              | 'rejected'
              | 'active'
              | 'ended',
            createdAt: p.createdAt,
            endDate: p.endDate,
          }));
          this.allProducts.set(transformed);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading auctions:', error);
          this.allProducts.set([]);
          this.loading.set(false);
        },
      });
  }

  toggleFilters() {
    this.showFilters.update((v) => !v);
  }

  clearAllFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.priceRangeMin.set(0);
    this.priceRangeMax.set(1000000);
    this.sortBy.set('newest');
  }

  getCategoryName(category: string): string {
    const key = `auctions.categories.${category}` as any;
    return this.translationService.t(key);
  }

  getImageUrl(product: AuctionProduct): string {
    if (product.mainImageUrl) {
      return product.mainImageUrl.startsWith('http')
        ? product.mainImageUrl
        : `${environment.apiUrl}${product.mainImageUrl}`;
    }
    return 'https://via.placeholder.com/400x300/1a1a1a/d4af37?text=No+Image';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  onProductClick(product: AuctionProduct) {
    this.router.navigate(['/auctions', product._id]);
  }

  // Sellers Modal Functions
  openSellersModal() {
    this.showSellersModal.set(true);
    this.loadSellers();
  }

  closeSellersModal() {
    this.showSellersModal.set(false);
  }

  loadSellers() {
    this.sellersLoading.set(true);
    this.http.get<Seller[]>(`${environment.apiUrl}/seller-likes/sellers/stats`).subscribe({
      next: (sellers) => {
        this.sellers.set(sellers);
        this.sellersLoading.set(false);
        // تحميل حالة الإعجابات للمستخدم الحالي بعد تحميل البائعين
        this.loadUserLikes();
      },
      error: (error) => {
        console.error('Error loading sellers:', error);
        this.sellers.set([]);
        this.sellersLoading.set(false);
      },
    });
  }

  loadSellersLikes() {
    // تحميل عدد القلوب لكل بائع
    this.http.get<Seller[]>(`${environment.apiUrl}/seller-likes/sellers/stats`).subscribe({
      next: (sellers) => {
        const likesMap = new Map<string, number>();
        sellers.forEach((seller) => {
          likesMap.set(seller.sellerId, seller.likesCount);
        });
        this.sellerLikesMap.set(likesMap);

        // تحديث المنتجات بعدد القلوب
        this.allProducts.update((products) => {
          return products.map((product) => {
            const likesCount = likesMap.get(product.userId._id) || 0;
            return { ...product, sellerLikesCount: likesCount };
          });
        });
      },
      error: (error) => {
        console.error('Error loading sellers likes:', error);
      },
    });
  }

  getSellerLikesCount(sellerId: string): number {
    return this.sellerLikesMap().get(sellerId) || 0;
  }

  getSellerImageUrl(seller: Seller): string {
    if (seller.profileImageUrl) {
      return seller.profileImageUrl.startsWith('http')
        ? seller.profileImageUrl
        : `${environment.apiUrl}${seller.profileImageUrl}`;
    }
    return '';
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  // التحقق من إعجاب المستخدم الحالي بالبائع
  isSellerLikedByUser(sellerId: string): boolean {
    return this.sellerLikedByUser().has(sellerId);
  }

  // تبديل الإعجاب
  toggleSellerLike(seller: Seller) {
    const user = this.currentUser();
    if (!user) {
      alert(this.isArabic() ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    // منع التكرار إذا كان الطلب قيد التنفيذ
    if (this.likingInProgress().has(seller.sellerId)) {
      return;
    }

    // إضافة للمجموعة قيد التنفيذ
    this.likingInProgress.update((set) => {
      const newSet = new Set(set);
      newSet.add(seller.sellerId);
      return newSet;
    });

    this.sellerService.toggleLike(seller.sellerId, user.id).subscribe({
      next: (res) => {
        // تحديث حالة الإعجاب
        this.sellerLikedByUser.update((set) => {
          const newSet = new Set(set);
          if (res.liked) {
            newSet.add(seller.sellerId);
          } else {
            newSet.delete(seller.sellerId);
          }
          return newSet;
        });

        // تحديث عدد الإعجابات في القائمة
        this.sellers.update((sellers) => {
          return sellers.map((s) =>
            s.sellerId === seller.sellerId ? { ...s, likesCount: res.count } : s,
          );
        });

        // إزالة من المجموعة قيد التنفيذ
        this.likingInProgress.update((set) => {
          const newSet = new Set(set);
          newSet.delete(seller.sellerId);
          return newSet;
        });
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        // إزالة من المجموعة قيد التنفيذ
        this.likingInProgress.update((set) => {
          const newSet = new Set(set);
          newSet.delete(seller.sellerId);
          return newSet;
        });
        alert(this.isArabic() ? 'حدث خطأ أثناء تسجيل الإعجاب' : 'Error liking seller');
      },
    });
  }

  // تحميل حالة الإعجابات للمستخدم الحالي
  loadUserLikes() {
    const user = this.currentUser();
    if (!user) return;

    // التحقق من كل بائع
    this.sellers().forEach((seller) => {
      this.sellerService.checkIfLiked(seller.sellerId, user.id).subscribe({
        next: (res) => {
          if (res.isLiked) {
            this.sellerLikedByUser.update((set) => {
              const newSet = new Set(set);
              newSet.add(seller.sellerId);
              return newSet;
            });
          }
        },
        error: () => {}, // تجاهل الأخطاء
      });
    });
  }

  // التحقق من أن الإعجاب قيد التنفيذ
  isLikingInProgress(sellerId: string): boolean {
    return this.likingInProgress().has(sellerId);
  }
}
