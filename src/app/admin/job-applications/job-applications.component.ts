import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

interface JobApplication {
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
  backupEmail: string;
  whatsappPhone: string;
  linkedinUrl?: string;
  githubUrl?: string;
  facebookUrl?: string;
  cvFileUrl: string;
  cvFilename: string;
  experience: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe],
  templateUrl: './job-applications.component.html',
  styleUrl: './job-applications.component.sass',
})
export class JobApplicationsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());

  applications = signal<JobApplication[]>([]);
  isLoading = signal(false);
  selectedApplication = signal<JobApplication | null>(null);
  showResponseModal = signal(false);
  adminNoteInput = '';
  responseStatus: 'accepted' | 'rejected' = 'accepted';

  // Translations
  title = computed(() => this.translationService.t('admin.jobApplications.title'));
  category = computed(() => this.translationService.t('admin.jobApplications.category'));
  backupEmail = computed(() => this.translationService.t('admin.jobApplications.backupEmail'));
  whatsappPhone = computed(() => this.translationService.t('admin.jobApplications.whatsappPhone'));
  linkedinUrl = computed(() => this.translationService.t('admin.jobApplications.linkedinUrl'));
  githubUrl = computed(() => this.translationService.t('admin.jobApplications.githubUrl'));
  facebookUrl = computed(() => this.translationService.t('admin.jobApplications.facebookUrl'));
  cvFile = computed(() => this.translationService.t('admin.jobApplications.cvFile'));
  experience = computed(() => this.translationService.t('admin.jobApplications.experience'));
  status = computed(() => this.translationService.t('admin.jobApplications.status'));
  createdAt = computed(() => this.translationService.t('admin.jobApplications.createdAt'));
  actions = computed(() => this.translationService.t('admin.jobApplications.actions'));
  respond = computed(() => this.translationService.t('admin.jobApplications.respond'));
  adminNote = computed(() => this.translationService.t('admin.jobApplications.adminNote'));
  accept = computed(() => this.translationService.t('admin.jobApplications.accept'));
  reject = computed(() => this.translationService.t('admin.jobApplications.reject'));
  pending = computed(() => this.translationService.t('admin.jobApplications.pending'));
  accepted = computed(() => this.translationService.t('admin.jobApplications.accepted'));
  rejected = computed(() => this.translationService.t('admin.jobApplications.rejected'));
  noApplications = computed(() =>
    this.translationService.t('admin.jobApplications.noApplications'),
  );
  back = computed(() => this.translationService.t('admin.jobApplications.back'));
  submit = computed(() => this.translationService.t('admin.jobApplications.submit'));
  cancel = computed(() => this.translationService.t('admin.jobApplications.cancel'));
  delete = computed(() => this.translationService.t('admin.jobApplications.delete'));

  getCategoryLabel(category: string): string {
    const categoryKey = `joinUs.${category}`;
    return this.translationService.t(categoryKey as any);
  }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading.set(true);
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .get<JobApplication[]>(`${environment.apiUrl}/job-applications`, { headers })
      .subscribe({
        next: (applications) => {
          this.applications.set(applications);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.isLoading.set(false);
        },
      });
  }

  openResponseModal(application: JobApplication, status: 'accepted' | 'rejected') {
    this.selectedApplication.set(application);
    this.responseStatus = status;
    this.adminNoteInput = '';
    this.showResponseModal.set(true);
  }

  closeResponseModal() {
    this.showResponseModal.set(false);
    this.selectedApplication.set(null);
    this.adminNoteInput = '';
  }

  submitResponse() {
    const application = this.selectedApplication();
    if (!application || !this.adminNoteInput.trim()) {
      return;
    }

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .put(
        `${environment.apiUrl}/job-applications/${application._id}/respond`,
        {
          status: this.responseStatus,
          adminNote: this.adminNoteInput,
        },
        { headers },
      )
      .subscribe({
        next: () => {
          this.loadApplications();
          this.closeResponseModal();
          alert(this.isArabic() ? 'تم إرسال الرد بنجاح' : 'Response sent successfully');
        },
        error: (error) => {
          console.error('Error submitting response:', error);
          alert(this.isArabic() ? 'حدث خطأ أثناء إرسال الرد' : 'Error submitting response');
        },
      });
  }

  viewCv(application: JobApplication) {
    window.open(`${environment.apiUrl}${application.cvFileUrl}`, '_blank');
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return this.pending();
      case 'accepted':
        return this.accepted();
      case 'rejected':
        return this.rejected();
      default:
        return status;
    }
  }

  deleteApplication(application: JobApplication) {
    if (application.status !== 'accepted' && application.status !== 'rejected') {
      return;
    }

    if (
      !confirm(
        this.isArabic()
          ? 'هل أنت متأكد من حذف هذا الطلب؟'
          : 'Are you sure you want to delete this application?',
      )
    ) {
      return;
    }

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .delete(`${environment.apiUrl}/job-applications/${application._id}`, { headers })
      .subscribe({
        next: () => {
          this.loadApplications();
          alert(this.isArabic() ? 'تم حذف الطلب بنجاح' : 'Application deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting application:', error);
          alert(this.isArabic() ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting application');
        },
      });
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }
}
