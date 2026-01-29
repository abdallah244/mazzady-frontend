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
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/translation.service';
import { AuthService } from '../../auth/auth.service';
import { SellerService } from '../../core/seller.service';
import { LoadingButtonDirective } from '../../shared/loading-button.directive';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

interface AuctionDetails {
  _id: string;
  productName: string;
  sellerId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    nickname: string;
    profileImageUrl?: string;
  };
  startingPrice: number;
  minBidIncrement: number;
  mainImageUrl: string;
  additionalImagesUrl: string[];
  status: 'active' | 'ended';
  highestBid: number | null;
  highestBidderId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    nickname: string;
  };
  endDate: string;
  category?: string;
}

interface Bid {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    nickname: string;
    profileImageUrl?: string;
  };
  amount: number;
  createdAt: string;
}

@Component({
  selector: 'app-auction-details',
  imports: [CommonModule, FormsModule, LoadingButtonDirective, AssetUrlPipe],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.sass',
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private sellerService = inject(SellerService);

  isArabic = computed(() => this.translationService.isArabic());
  currentUser = computed(() => this.authService.currentUser());

  auction = signal<AuctionDetails | null>(null);
  bids = signal<Bid[]>([]);
  isLoading = signal(true);
  bidAmount = '';
  isPlacingBid = signal(false);
  activeImage = signal<string | null>(null);
  sellerLikesCount = signal(0);
  isLiked = signal(false);

  private timerInterval: any;

  ngOnInit() {
    const auctionId = this.route.snapshot.paramMap.get('id');
    if (auctionId) {
      this.loadAuctionDetails(auctionId);
      this.loadBids(auctionId);
    }

    // Update timer every second
    this.timerInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadAuctionDetails(auctionId: string) {
    this.isLoading.set(true);
    this.http.get<AuctionDetails>(`${environment.apiUrl}/auctions/${auctionId}`).subscribe({
      next: (auction) => {
        this.auction.set(auction);
        this.activeImage.set(auction.mainImageUrl);
        this.loadSellerLikes(auction.sellerId._id);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadSellerLikes(sellerId: string) {
    // Get total likes
    this.sellerService.getSellerStats(sellerId).subscribe({
      next: (stats) => {
        this.sellerLikesCount.set(stats.count || 0);
      },
      error: () => this.sellerLikesCount.set(0),
    });

    // Check if current user liked
    const user = this.currentUser();
    if (user) {
      this.sellerService.checkIfLiked(sellerId, user.id).subscribe({
        next: (res) => this.isLiked.set(res.isLiked),
        error: () => this.isLiked.set(false),
      });
    }
  }

  toggleLike() {
    const user = this.currentUser();
    const auction = this.auction();
    if (!user || !auction) {
      alert(this.isArabic() ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    const sellerId = auction.sellerId._id;
    this.sellerService.toggleLike(sellerId, user.id).subscribe({
      next: (res) => {
        this.isLiked.set(res.liked);
        this.sellerLikesCount.set(res.count);
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        alert(this.isArabic() ? 'حدث خطأ أثناء تسجيل الإعجاب' : 'Error liking seller');
      },
    });
  }

  setActiveImage(url: string) {
    this.activeImage.set(url);
  }

  loadBids(auctionId: string) {
    this.http.get<Bid[]>(`${environment.apiUrl}/bids/auction/${auctionId}`).subscribe({
      next: (bids) => {
        this.bids.set(bids);
      },
      error: (error) => {
        console.error('Error loading bids:', error);
      },
    });
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

  formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined) {
      return this.isArabic() ? '0 ج.م' : 'EGP 0';
    }
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.isArabic() ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getMinBidAmount(): number {
    const auction = this.auction();
    if (!auction) return 0;
    const currentHighest = auction.highestBid || auction.startingPrice;
    return currentHighest + auction.minBidIncrement;
  }

  placeBid() {
    const auction = this.auction();
    const user = this.currentUser();
    if (!auction || !user) {
      alert(this.isArabic() ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    const amount = parseFloat(this.bidAmount);
    const minAmount = this.getMinBidAmount();

    if (isNaN(amount) || amount < minAmount) {
      alert(
        this.isArabic()
          ? `يجب أن تكون المزايدة على الأقل ${this.formatPrice(minAmount)}`
          : `Bid must be at least ${this.formatPrice(minAmount)}`,
      );
      return;
    }

    this.isPlacingBid.set(true);
    this.http
      .post(`${environment.apiUrl}/bids`, {
        auctionId: auction._id,
        userId: user.id,
        amount: amount,
      })
      .subscribe({
        next: () => {
          this.bidAmount = '';
          this.loadAuctionDetails(auction._id);
          this.loadBids(auction._id);
          this.isPlacingBid.set(false);
          alert(this.isArabic() ? 'تم تقديم المزايدة بنجاح' : 'Bid placed successfully');
        },
        error: (error) => {
          console.error('Error placing bid:', error);
          this.isPlacingBid.set(false);
          alert(
            error.error?.message ||
              (this.isArabic() ? 'حدث خطأ أثناء تقديم المزايدة' : 'Error placing bid'),
          );
        },
      });
  }

  getImageUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  goBack() {
    this.router.navigate(['/auctions']);
  }
}
