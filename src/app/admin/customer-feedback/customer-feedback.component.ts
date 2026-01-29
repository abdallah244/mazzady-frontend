import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

interface CustomerTicket {
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
  category: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  reviewedBy?: {
    _id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email: string;
  };
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-customer-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe],
  templateUrl: './customer-feedback.component.html',
  styleUrl: './customer-feedback.component.sass',
})
export class CustomerFeedbackComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());

  tickets = signal<CustomerTicket[]>([]);
  isLoading = signal(false);
  selectedTicket = signal<CustomerTicket | null>(null);
  showResponseModal = signal(false);
  adminResponseInput = '';

  // Translations
  title = computed(() => this.translationService.t('admin.customerFeedback.title'));
  category = computed(() => this.translationService.t('admin.customerFeedback.category'));
  subject = computed(() => this.translationService.t('admin.customerFeedback.subject'));
  message = computed(() => this.translationService.t('admin.customerFeedback.message'));
  status = computed(() => this.translationService.t('admin.customerFeedback.status'));
  createdAt = computed(() => this.translationService.t('admin.customerFeedback.createdAt'));
  actions = computed(() => this.translationService.t('admin.customerFeedback.actions'));
  respond = computed(() => this.translationService.t('admin.customerFeedback.respond'));
  adminResponse = computed(() => this.translationService.t('admin.customerFeedback.adminResponse'));
  pending = computed(() => this.translationService.t('admin.customerFeedback.pending'));
  inProgress = computed(() => this.translationService.t('admin.customerFeedback.inProgress'));
  resolved = computed(() => this.translationService.t('admin.customerFeedback.resolved'));
  closed = computed(() => this.translationService.t('admin.customerFeedback.closed'));
  noTickets = computed(() => this.translationService.t('admin.customerFeedback.noTickets'));
  back = computed(() => this.translationService.t('admin.customerFeedback.back'));
  delete = computed(() => this.translationService.t('admin.customerFeedback.delete'));

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.isLoading.set(true);
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .get<CustomerTicket[]>(`${environment.apiUrl}/customer-support`, { headers })
      .subscribe({
        next: (tickets) => {
          this.tickets.set(tickets);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading tickets:', error);
          this.isLoading.set(false);
        },
      });
  }

  openResponseModal(ticket: CustomerTicket) {
    this.selectedTicket.set(ticket);
    this.adminResponseInput = ticket.adminResponse || '';
    this.showResponseModal.set(true);
  }

  closeResponseModal() {
    this.showResponseModal.set(false);
    this.selectedTicket.set(null);
    this.adminResponseInput = '';
  }

  submitResponse() {
    const ticket = this.selectedTicket();
    if (!ticket || !this.adminResponseInput.trim()) {
      return;
    }

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .put(
        `${environment.apiUrl}/customer-support/${ticket._id}/respond`,
        {
          adminResponse: this.adminResponseInput,
          status: 'resolved',
        },
        { headers },
      )
      .subscribe({
        next: () => {
          this.loadTickets();
          this.closeResponseModal();
          alert(this.isArabic() ? 'تم إرسال الرد بنجاح' : 'Response sent successfully');
        },
        error: (error) => {
          console.error('Error submitting response:', error);
          alert(this.isArabic() ? 'حدث خطأ أثناء إرسال الرد' : 'Error submitting response');
        },
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'resolved':
        return 'status-resolved';
      case 'closed':
        return 'status-closed';
      case 'in_progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'resolved':
        return this.resolved();
      case 'closed':
        return this.closed();
      case 'in_progress':
        return this.inProgress();
      default:
        return this.pending();
    }
  }

  getCategoryText(category: string): string {
    const categoryMap: { [key: string]: string } = {
      delete_account: this.isArabic() ? 'حذف حساب' : 'Delete Account',
      deposit_issue: this.isArabic() ? 'مشكلة إيداع' : 'Deposit Issue',
      product_issue: this.isArabic() ? 'مشكلة في المنتج' : 'Product Issue',
      technical_issue: this.isArabic() ? 'مشكلة تقنية' : 'Technical Issue',
      general_inquiry: this.isArabic() ? 'استفسار عام' : 'General Inquiry',
      complaint: this.isArabic() ? 'شكوى' : 'Complaint',
    };
    return categoryMap[category] || category;
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }

  deleteTicket(ticket: CustomerTicket) {
    if (ticket.status === 'pending') {
      return;
    }

    const confirmMessage = this.isArabic()
      ? 'هل أنت متأكد من حذف هذه الرسالة؟'
      : 'Are you sure you want to delete this ticket?';

    if (confirm(confirmMessage)) {
      const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
      const headers: { [key: string]: string } = {};
      if (isAdminAuthenticated) {
        headers['x-admin-authenticated'] = 'true';
      }

      this.http
        .delete(`${environment.apiUrl}/customer-support/${ticket._id}`, { headers })
        .subscribe({
          next: () => {
            this.loadTickets();
            alert(this.isArabic() ? 'تم حذف الرسالة بنجاح' : 'Ticket deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting ticket:', error);
            alert(this.isArabic() ? 'حدث خطأ أثناء حذف الرسالة' : 'Error deleting ticket');
          },
        });
    }
  }
}
