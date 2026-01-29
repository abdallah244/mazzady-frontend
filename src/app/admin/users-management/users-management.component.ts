import {
  Component,
  inject,
  computed,
  signal,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/translation.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

declare var Chart: any;

export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nickname: string;
  phone: string;
  nationalId: string;
  profileImageUrl?: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  visitsThisMonth?: number;
  isOnline?: boolean;
  lastActivity?: string;
  createdAt?: string;
}

export interface UsersStats {
  totalUsers: number;
  onlineUsers: number;
  offlineUsers: number;
  totalVisits: number;
}

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, AssetUrlPipe],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.sass',
})
export class UsersManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: any = null;
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private refreshInterval: any = null;

  isArabic = computed(() => this.translationService.isArabic());
  users = signal<User[]>([]);
  stats = signal<UsersStats | null>(null);
  isLoading = signal(false);
  isRefreshing = signal(false);
  isRefreshingChart = signal(false);
  error = signal<string | null>(null);
  showNationalIdModal = signal(false);
  selectedUser = signal<User | null>(null);

  refreshChartText = computed(() => this.translationService.t('usersManagement.refreshChart'));
  refreshingChartText = computed(() =>
    this.translationService.t('usersManagement.refreshingChart'),
  );

  // Chart data
  chartLabels: string[] = [];
  chartData: number[] = [];

  ngOnInit() {
    this.loadUsers(false);
    // Auto-refresh chart every 10 minutes (600000ms)
    this.refreshInterval = setInterval(() => {
      this.refreshChart();
    }, 600000);
  }

  ngAfterViewInit() {
    // Chart will be initialized after view init
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  loadUsers(isRefresh: boolean = false) {
    if (isRefresh) {
      this.isRefreshing.set(true);
    } else {
      this.isLoading.set(true);
    }
    this.error.set(null);

    // Load users and stats
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (users) => {
        this.users.set(users);
        setTimeout(() => {
          this.updateChart();
        }, 100);
        this.loadStats(isRefresh);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error.set(this.isArabic() ? 'حدث خطأ أثناء تحميل المستخدمين' : 'Error loading users');
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
    });
  }

  loadStats(isRefresh: boolean = false) {
    this.http.get<UsersStats>(`${environment.apiUrl}/admin/users/stats`).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
    });
  }

  refreshChart() {
    this.isRefreshingChart.set(true);
    // Reload users data to update chart
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (users) => {
        this.users.set(users);
        setTimeout(() => {
          this.updateChart();
          this.isRefreshingChart.set(false);
        }, 100);
      },
      error: (error) => {
        console.error('Error refreshing chart:', error);
        this.isRefreshingChart.set(false);
      },
    });
  }

  updateChart() {
    const users = this.users();
    this.chartLabels = users.map((user) => user.nickname);
    this.chartData = users.map((user) => user.visitsThisMonth || 0);

    if (this.chartCanvas && typeof Chart !== 'undefined') {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      // Get current theme color
      const accentColor =
        getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() ||
        '#d4af37';
      const accentColorRgba = accentColor.startsWith('#')
        ? this.hexToRgba(accentColor, 0.1)
        : 'rgba(212, 175, 55, 0.1)';

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartLabels,
          datasets: [
            {
              label: this.isArabic() ? 'زيارات المستخدمين في الشهر' : 'User Visits This Month',
              data: this.chartData,
              borderColor: accentColor,
              backgroundColor: accentColorRgba,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }

  deleteUser(userId: string) {
    if (
      !confirm(
        this.isArabic()
          ? 'هل أنت متأكد من حذف هذا المستخدم؟'
          : 'Are you sure you want to delete this user?',
      )
    ) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http.delete(`${environment.apiUrl}/admin/users/${userId}`).subscribe({
      next: () => {
        this.users.update((users) => users.filter((user) => user.id !== userId));
        this.updateChart();
        this.loadStats();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.error.set(this.isArabic() ? 'حدث خطأ أثناء حذف المستخدم' : 'Error deleting user');
        this.isLoading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }

  getTotalVisits(): number {
    return this.stats()?.totalVisits || 0;
  }

  getTotalUsers(): number {
    return this.stats()?.totalUsers || 0;
  }

  getOnlineUsers(): number {
    return this.stats()?.onlineUsers || 0;
  }

  getOfflineUsers(): number {
    return this.stats()?.offlineUsers || 0;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return d.toLocaleDateString(this.isArabic() ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  }

  hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  openNationalIdModal(user: User) {
    if (user.nationalIdFrontUrl || user.nationalIdBackUrl) {
      this.selectedUser.set(user);
      this.showNationalIdModal.set(true);
    }
  }

  closeNationalIdModal() {
    this.showNationalIdModal.set(false);
    this.selectedUser.set(null);
  }

  hasNationalIdImages(user: User): boolean {
    return !!(user.nationalIdFrontUrl || user.nationalIdBackUrl);
  }

  getNationalIdImageUrl(user: User, side: 'front' | 'back'): string | null {
    const path = side === 'front' ? user.nationalIdFrontUrl : user.nationalIdBackUrl;
    return path ? `${environment.apiUrl}${path}` : null;
  }
}
