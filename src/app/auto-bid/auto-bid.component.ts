import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

interface AutoBid {
  _id: string;
  auctionId: {
    _id: string;
    productName: string;
    mainImageUrl: string;
    status: string;
    endDate: string;
  };
  maxBidAmount: number;
  incrementAmount: number;
  currentBidAmount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-auto-bid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-bid.component.html',
  styleUrl: './auto-bid.component.sass',
})
export class AutoBidComponent implements OnInit {
  private translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  isArabic = computed(() => this.translationService.isArabic());
  currentTheme = computed(() => this.themeService.theme());
  autoBids = signal<AutoBid[]>([]);
  isLoading = signal(false);
  showAddModal = signal(false);
  selectedAuctionId = signal<string>('');

  formData = {
    auctionId: '',
    maxBidAmount: 0,
    incrementAmount: 1,
  };

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAutoBids();
  }

  loadAutoBids() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.isLoading.set(true);
    this.http.get<AutoBid[]>(`${environment.apiUrl}/auto-bid/user/${currentUser.id}`).subscribe({
      next: (data) => {
        this.autoBids.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openAddModal(auctionId?: string) {
    if (auctionId) {
      this.formData.auctionId = auctionId;
    }
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.formData = { auctionId: '', maxBidAmount: 0, incrementAmount: 1 };
  }

  createAutoBid() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.http
      .post(`${environment.apiUrl}/auto-bid`, {
        userId: currentUser.id,
        auctionId: this.formData.auctionId,
        maxBidAmount: this.formData.maxBidAmount,
        incrementAmount: this.formData.incrementAmount,
      })
      .subscribe({
        next: () => {
          this.loadAutoBids();
          this.closeAddModal();
        },
      });
  }

  cancelAutoBid(auctionId: string) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.http
      .put(`${environment.apiUrl}/auto-bid/cancel/${currentUser.id}/${auctionId}`, {})
      .subscribe({
        next: () => {
          this.loadAutoBids();
        },
      });
  }

  navigateToAuction(auctionId: string) {
    this.router.navigate(['/auctions', auctionId]);
  }
}
