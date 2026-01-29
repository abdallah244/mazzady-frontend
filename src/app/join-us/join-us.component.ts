import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

enum JobCategory {
  FRONTEND_DEVELOPER = 'frontend_developer',
  BACKEND_DEVELOPER = 'backend_developer',
  FULL_STACK_DEVELOPER = 'full_stack_developer',
  UI_UX_DESIGNER = 'ui_ux_designer',
  GRAPHIC_DESIGNER = 'graphic_designer',
  MARKETING_SPECIALIST = 'marketing_specialist',
  CONTENT_WRITER = 'content_writer',
  DATA_ANALYST = 'data_analyst',
  PROJECT_MANAGER = 'project_manager',
  OTHER = 'other',
}

@Component({
  selector: 'app-join-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-us.component.html',
  styleUrl: './join-us.component.sass',
})
export class JoinUsComponent {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isArabic = computed(() => this.translationService.isArabic());
  isSubmitting = signal(false);
  showSuccessMessage = signal(false);
  errorMessage = signal<string | null>(null);
  selectedCvFile = signal<File | null>(null);
  cvFileName = signal<string>('');

  joinForm = this.fb.group({
    category: ['', [Validators.required]],
    backupEmail: ['', [Validators.required, Validators.email]],
    whatsappPhone: ['', [Validators.required]],
    linkedinUrl: ['', [Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.+/i)]],
    githubUrl: ['', [Validators.pattern(/^https?:\/\/(www\.)?github\.com\/.+/i)]],
    facebookUrl: ['', [Validators.pattern(/^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/i)]],
    experience: ['', [Validators.required, Validators.minLength(20)]],
  });

  categories = [
    { value: JobCategory.FRONTEND_DEVELOPER, label: 'joinUs.frontendDeveloper' },
    { value: JobCategory.BACKEND_DEVELOPER, label: 'joinUs.backendDeveloper' },
    { value: JobCategory.FULL_STACK_DEVELOPER, label: 'joinUs.fullStackDeveloper' },
    { value: JobCategory.UI_UX_DESIGNER, label: 'joinUs.uiUxDesigner' },
    { value: JobCategory.GRAPHIC_DESIGNER, label: 'joinUs.graphicDesigner' },
    { value: JobCategory.MARKETING_SPECIALIST, label: 'joinUs.marketingSpecialist' },
    { value: JobCategory.CONTENT_WRITER, label: 'joinUs.contentWriter' },
    { value: JobCategory.DATA_ANALYST, label: 'joinUs.dataAnalyst' },
    { value: JobCategory.PROJECT_MANAGER, label: 'joinUs.projectManager' },
    { value: JobCategory.OTHER, label: 'joinUs.other' },
  ];

  // Translations
  title = computed(() => this.translationService.t('joinUs.title'));
  categoryLabel = computed(() => this.translationService.t('joinUs.category'));
  backupEmailLabel = computed(() => this.translationService.t('joinUs.backupEmail'));
  whatsappPhoneLabel = computed(() => this.translationService.t('joinUs.whatsappPhone'));
  linkedinUrlLabel = computed(() => this.translationService.t('joinUs.linkedinUrl'));
  githubUrlLabel = computed(() => this.translationService.t('joinUs.githubUrl'));
  facebookUrlLabel = computed(() => this.translationService.t('joinUs.facebookUrl'));
  cvFileLabel = computed(() => this.translationService.t('joinUs.cvFile'));
  experienceLabel = computed(() => this.translationService.t('joinUs.experience'));
  submitButton = computed(() => this.translationService.t('joinUs.submit'));
  cancelButton = computed(() => this.translationService.t('joinUs.cancel'));
  successMessage = computed(() => this.translationService.t('joinUs.successMessage'));
  errorMessageText = computed(() => this.translationService.t('joinUs.errorMessage'));
  selectFile = computed(() => this.translationService.t('joinUs.selectFile'));
  removeFile = computed(() => this.translationService.t('joinUs.removeFile'));
  required = computed(() => this.translationService.t('profile.required'));
  invalidEmail = computed(() => this.translationService.t('joinUs.invalidEmail'));
  invalidUrl = computed(() => this.translationService.t('joinUs.invalidUrl'));
  minLength = computed(() => this.translationService.t('joinUs.minLength'));

  getCategoryLabel(categoryKey: string): string {
    return this.translationService.t(categoryKey as any);
  }

  onCvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        this.errorMessage.set(
          this.isArabic() ? 'يجب أن يكون الملف بصيغة PDF' : 'File must be a PDF',
        );
        return;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage.set(
          this.isArabic()
            ? 'حجم الملف يجب أن يكون أقل من 10 ميجابايت'
            : 'File size must be less than 10MB',
        );
        return;
      }

      this.selectedCvFile.set(file);
      this.cvFileName.set(file.name);
      this.errorMessage.set(null);
    }
  }

  removeCvFile() {
    this.selectedCvFile.set(null);
    this.cvFileName.set('');
    const input = document.getElementById('cvFile') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  onSubmit() {
    if (this.joinForm.invalid) {
      this.joinForm.markAllAsTouched();
      return;
    }

    if (!this.selectedCvFile()) {
      this.errorMessage.set(this.isArabic() ? 'يجب رفع ملف السيرة الذاتية' : 'CV file is required');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage.set(this.isArabic() ? 'يجب تسجيل الدخول أولاً' : 'You must login first');
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('category', this.joinForm.get('category')?.value || '');
    formData.append('backupEmail', this.joinForm.get('backupEmail')?.value || '');
    formData.append('whatsappPhone', this.joinForm.get('whatsappPhone')?.value || '');
    formData.append('linkedinUrl', this.joinForm.get('linkedinUrl')?.value || '');
    formData.append('githubUrl', this.joinForm.get('githubUrl')?.value || '');
    formData.append('facebookUrl', this.joinForm.get('facebookUrl')?.value || '');
    formData.append('experience', this.joinForm.get('experience')?.value || '');

    if (this.selectedCvFile()) {
      formData.append('cvFile', this.selectedCvFile()!);
    }

    this.http.post(`${environment.apiUrl}/job-applications`, formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showSuccessMessage.set(true);
        this.joinForm.reset();
        this.removeCvFile();

        setTimeout(() => {
          this.showSuccessMessage.set(false);
          this.router.navigate(['/home']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.error?.message ||
            (this.isArabic() ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting application'),
        );
      },
    });
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}
