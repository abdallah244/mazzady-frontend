import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  users: {
    total: number;
    online: number;
  };
  moneyRequests: {
    pending: number;
  };
  customerSupport: {
    pending: number;
  };
  jobApplications: {
    pending: number;
  };
  auctionProducts: {
    pending: number;
  };
  auctions: {
    active: number;
    total: number;
  };
}

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.sass',
})
export class AdminPanelComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());
  stats = signal<DashboardStats | null>(null);
  isLoading = signal(false);
  Math = Math; // Make Math available in template

  logout() {
    sessionStorage.removeItem('adminAuthenticated');
    this.router.navigate(['/login']);
  }

  goToUsersManagement() {
    this.router.navigate(['/admin/users']);
  }

  goToEditHomePage() {
    this.router.navigate(['/admin/edit-home']);
  }

  goToMoneyRequests() {
    this.router.navigate(['/admin/money-requests']);
  }

  goToCustomerFeedback() {
    this.router.navigate(['/admin/customer-feedback']);
  }

  goToJobApplications() {
    this.router.navigate(['/admin/job-applications']);
  }

  goToAuctionProducts() {
    this.router.navigate(['/admin/auction-products']);
  }

  goToAuctionsManagement() {
    this.router.navigate(['/admin/auctions-management']);
  }

  goToSendMessages() {
    this.router.navigate(['/admin/send-messages']);
  }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.http.get<DashboardStats>(`${environment.apiUrl}/admin/dashboard/stats`).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading.set(false);
      },
    });
  }
}
