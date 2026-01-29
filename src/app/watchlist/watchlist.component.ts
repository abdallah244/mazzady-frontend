import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

interface WatchlistItem {
  _id: string;
  auctionId: {
    _id: string;
    productName: string;
    mainImageUrl: string;
    status: string;
    endDate: string;
    highestBid: number;
  };
  addedAt: string;
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.sass',
})
export class WatchlistComponent implements OnInit {
  translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  isArabic = computed(() => this.translationService.isArabic());
  currentTheme = computed(() => this.themeService.theme());
  watchlistItems = signal<WatchlistItem[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadWatchlist();
  }

  loadWatchlist() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.isLoading.set(true);
    this.http
      .get<WatchlistItem[]>(`${environment.apiUrl}/watchlist/user/${currentUser.id}`)
      .subscribe({
        next: (data) => {
          this.watchlistItems.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  removeFromWatchlist(auctionId: string) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.http.delete(`${environment.apiUrl}/watchlist/${currentUser.id}/${auctionId}`).subscribe({
      next: () => {
        this.watchlistItems.set(
          this.watchlistItems().filter((item) => item.auctionId._id !== auctionId),
        );
      },
    });
  }

  navigateToAuction(auctionId: string) {
    this.router.navigate(['/auctions', auctionId]);
  }

  getTimeRemaining(endDate: string): string {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return this.isArabic() ? 'انتهى' : 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ${this.isArabic() ? 'يوم' : 'days'}`;
    if (hours > 0) return `${hours} ${this.isArabic() ? 'ساعة' : 'hours'}`;
    return `${minutes} ${this.isArabic() ? 'دقيقة' : 'minutes'}`;
  }
}
