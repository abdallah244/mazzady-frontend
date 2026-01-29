import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  auctionId?: {
    _id: string;
    productName: string;
    mainImageUrl: string;
  };
  link?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.sass',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  isArabic = computed(() => this.translationService.isArabic());
  currentTheme = computed(() => this.themeService.theme());
  notifications = signal<Notification[]>([]);
  isLoading = signal(false);
  unreadCount = signal(0);
  private updateInterval: any;

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadNotifications();
    // تحديث كل 30 ثانية
    this.updateInterval = setInterval(() => this.loadNotifications(), 30000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  loadNotifications() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.isLoading.set(true);
    this.http
      .get<Notification[]>(`${environment.apiUrl}/notifications/user/${currentUser.id}`)
      .subscribe({
        next: (data) => {
          this.notifications.set(data);
          this.unreadCount.set(data.filter((n) => !n.isRead).length);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.http
      .put(`${environment.apiUrl}/notifications/${notification._id}/read`, {
        userId: currentUser.id,
      })
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadCount.set(this.unreadCount() - 1);
        },
      });
  }

  markAllAsRead() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.http
      .put(`${environment.apiUrl}/notifications/user/${currentUser.id}/read-all`, {})
      .subscribe({
        next: () => {
          this.notifications().forEach((n) => (n.isRead = true));
          this.unreadCount.set(0);
        },
      });
  }

  deleteNotification(id: string) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.http
      .delete(`${environment.apiUrl}/notifications/${id}`, {
        body: { userId: currentUser.id },
      })
      .subscribe({
        next: () => {
          this.notifications.set(this.notifications().filter((n) => n._id !== id));
        },
      });
  }

  navigateToNotification(notification: Notification) {
    this.markAsRead(notification);
    if (notification.link) {
      this.router.navigate([notification.link]);
    } else if (notification.auctionId) {
      this.router.navigate(['/auctions', notification.auctionId._id]);
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      bid_outbid: 'fa-arrow-up',
      auction_won: 'fa-trophy',
      auction_ended: 'fa-clock',
      new_auction: 'fa-bell',
      bid_placed: 'fa-gavel',
      shipping_update: 'fa-truck',
      payment_received: 'fa-money-bill',
      review_request: 'fa-star',
      points_earned: 'fa-coins',
      flash_auction: 'fa-bolt',
    };
    return icons[type] || 'fa-bell';
  }
}
