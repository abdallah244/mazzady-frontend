import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

interface MoneyRequest {
  _id: string;
  userId: {
    _id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
    phone?: string;
  };
  amount: number;
  phoneNumber: string;
  depositImageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    _id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email: string;
  };
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-money-requests',
  imports: [CommonModule, AssetUrlPipe],
  templateUrl: './money-requests.component.html',
  styleUrl: './money-requests.component.sass',
})
export class MoneyRequestsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());

  requests = signal<MoneyRequest[]>([]);
  isLoading = signal(false);
  selectedRequest = signal<MoneyRequest | null>(null);
  showImageModal = signal(false);
  reviewNote = signal('');
  reviewNoteInput = '';

  // Translations
  title = computed(() => this.translationService.t('admin.moneyRequests.title'));
  amount = computed(() => this.translationService.t('admin.moneyRequests.amount'));
  user = computed(() => this.translationService.t('admin.moneyRequests.user'));
  phoneNumber = computed(() => this.translationService.t('admin.moneyRequests.phoneNumber'));
  status = computed(() => this.translationService.t('admin.moneyRequests.status'));
  depositImage = computed(() => this.translationService.t('admin.moneyRequests.depositImage'));
  createdAt = computed(() => this.translationService.t('admin.moneyRequests.createdAt'));
  actions = computed(() => this.translationService.t('admin.moneyRequests.actions'));
  approve = computed(() => this.translationService.t('admin.moneyRequests.approve'));
  reject = computed(() => this.translationService.t('admin.moneyRequests.reject'));
  reviewNoteLabel = computed(() => this.translationService.t('admin.moneyRequests.reviewNote'));
  pending = computed(() => this.translationService.t('admin.moneyRequests.pending'));
  approved = computed(() => this.translationService.t('admin.moneyRequests.approved'));
  rejected = computed(() => this.translationService.t('admin.moneyRequests.rejected'));
  noRequests = computed(() => this.translationService.t('admin.moneyRequests.noRequests'));
  back = computed(() => this.translationService.t('admin.moneyRequests.back'));
  delete = computed(() => this.translationService.t('admin.moneyRequests.delete'));
  deleteRequestConfirm = computed(() =>
    this.translationService.t('admin.moneyRequests.deleteRequestConfirm'),
  );

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading.set(true);
    // Check if admin is authenticated
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http.get<MoneyRequest[]>(`${environment.apiUrl}/money-requests`, { headers }).subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading.set(false);
      },
    });
  }

  viewImage(request: MoneyRequest) {
    this.selectedRequest.set(request);
    this.showImageModal.set(true);
  }

  closeImageModal() {
    this.showImageModal.set(false);
    this.selectedRequest.set(null);
  }

  approveRequest(request: MoneyRequest) {
    if (
      confirm(
        this.isArabic()
          ? 'هل أنت متأكد من الموافقة على هذا الطلب؟'
          : 'Are you sure you want to approve this request?',
      )
    ) {
      const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
      const headers: { [key: string]: string } = {};
      if (isAdminAuthenticated) {
        headers['x-admin-authenticated'] = 'true';
      }

      this.http
        .put(
          `${environment.apiUrl}/money-requests/${request._id}/approve`,
          {
            reviewNote: this.reviewNoteInput || undefined,
          },
          { headers },
        )
        .subscribe({
          next: () => {
            this.loadRequests();
            this.reviewNoteInput = '';
          },
          error: (error) => {
            console.error('Error approving request:', error);
            alert(this.isArabic() ? 'حدث خطأ أثناء الموافقة على الطلب' : 'Error approving request');
          },
        });
    }
  }

  rejectRequest(request: MoneyRequest) {
    if (
      confirm(
        this.isArabic()
          ? 'هل أنت متأكد من رفض هذا الطلب؟'
          : 'Are you sure you want to reject this request?',
      )
    ) {
      const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
      const headers: { [key: string]: string } = {};
      if (isAdminAuthenticated) {
        headers['x-admin-authenticated'] = 'true';
      }

      this.http
        .put(
          `${environment.apiUrl}/money-requests/${request._id}/reject`,
          {
            reviewNote: this.reviewNoteInput || undefined,
          },
          { headers },
        )
        .subscribe({
          next: () => {
            this.loadRequests();
            this.reviewNoteInput = '';
          },
          error: (error) => {
            console.error('Error rejecting request:', error);
            alert(this.isArabic() ? 'حدث خطأ أثناء رفض الطلب' : 'Error rejecting request');
          },
        });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return this.approved();
      case 'rejected':
        return this.rejected();
      default:
        return this.pending();
    }
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }

  deleteRequest(request: MoneyRequest) {
    // Only allow deletion for approved or rejected requests
    if (request.status !== 'approved' && request.status !== 'rejected') {
      return;
    }

    const confirmMessage = this.isArabic()
      ? 'هل أنت متأكد من حذف هذا الطلب؟'
      : 'Are you sure you want to delete this request?';

    if (confirm(confirmMessage)) {
      const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
      const headers: { [key: string]: string } = {};
      if (isAdminAuthenticated) {
        headers['x-admin-authenticated'] = 'true';
      }

      this.http
        .delete(`${environment.apiUrl}/money-requests/${request._id}`, { headers })
        .subscribe({
          next: () => {
            this.loadRequests();
            alert(this.isArabic() ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting request:', error);
            alert(this.isArabic() ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting request');
          },
        });
    }
  }
}
