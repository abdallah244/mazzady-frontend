import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

enum SupportCategory {
  DELETE_ACCOUNT = 'delete_account',
  DEPOSIT_ISSUE = 'deposit_issue',
  PRODUCT_ISSUE = 'product_issue',
  TECHNICAL_ISSUE = 'technical_issue',
  GENERAL_INQUIRY = 'general_inquiry',
  COMPLAINT = 'complaint',
}

@Component({
  selector: 'app-customer-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-service.component.html',
  styleUrl: './customer-service.component.sass',
})
export class CustomerServiceComponent implements OnInit {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());
  isSubmitting = signal(false);
  showSuccessMessage = signal(false);
  errorMessage = signal<string | null>(null);

  supportForm = this.fb.group({
    category: ['', [Validators.required]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  categories = [
    { value: SupportCategory.DELETE_ACCOUNT, label: 'customerService.deleteAccount' },
    { value: SupportCategory.DEPOSIT_ISSUE, label: 'customerService.depositIssue' },
    { value: SupportCategory.PRODUCT_ISSUE, label: 'customerService.productIssue' },
    { value: SupportCategory.TECHNICAL_ISSUE, label: 'customerService.technicalIssue' },
    { value: SupportCategory.GENERAL_INQUIRY, label: 'customerService.generalInquiry' },
    { value: SupportCategory.COMPLAINT, label: 'customerService.complaint' },
  ];

  // Translations
  title = computed(() => this.translationService.t('customerService.title'));
  categoryLabel = computed(() => this.translationService.t('customerService.category'));
  subjectLabel = computed(() => this.translationService.t('customerService.subject'));
  messageLabel = computed(() => this.translationService.t('customerService.message'));
  submitButton = computed(() => this.translationService.t('customerService.submit'));
  cancelButton = computed(() => this.translationService.t('customerService.cancel'));
  successMessage = computed(() => this.translationService.t('customerService.successMessage'));
  errorMessageText = computed(() => this.translationService.t('customerService.errorMessage'));

  getCategoryLabel(categoryKey: string): string {
    return this.translationService.t(categoryKey as any);
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
  }

  onSubmit() {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.supportForm.value;
    this.http
      .post(`${environment.apiUrl}/customer-support`, {
        userId: currentUser.id,
        category: formValue.category,
        subject: formValue.subject,
        message: formValue.message,
      })
      .subscribe({
        next: () => {
          this.showSuccessMessage.set(true);
          this.supportForm.reset();
          setTimeout(() => {
            this.showSuccessMessage.set(false);
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (error) => {
          console.error('Error submitting ticket:', error);
          this.errorMessage.set(error.error?.message || this.errorMessageText());
          this.isSubmitting.set(false);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.supportForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return this.isArabic() ? 'هذا الحقل مطلوب' : 'This field is required';
    }
    if (field?.hasError('minlength') && field?.touched) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return this.isArabic()
        ? `يجب أن يكون على الأقل ${minLength} أحرف`
        : `Must be at least ${minLength} characters`;
    }
    return null;
  }
}
