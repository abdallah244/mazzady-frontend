import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { AuthService } from '../auth/auth.service';
import { LoadingButtonDirective } from '../shared/loading-button.directive';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sell-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingButtonDirective],
  templateUrl: './sell-product.component.html',
  styleUrl: './sell-product.component.sass',
})
export class SellProductComponent {
  private translationService = inject(TranslationService);
  router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isArabic = computed(() => this.translationService.isArabic());
  isSubmitting = signal(false);
  showSuccessMessage = signal(false);
  errorMessage = signal<string | null>(null);

  mainImage = signal<File | null>(null);
  mainImagePreview = signal<string | null>(null);
  additionalImages = signal<File[]>([]);
  additionalImagesPreview = signal<string[]>([]);

  sellForm = this.fb.group({
    productName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    startingPrice: ['', [Validators.required, Validators.min(0.01)]],
    minBidIncrement: ['1', [Validators.required, Validators.min(1)]],
    durationInSeconds: [86400, [Validators.required, Validators.min(1)]], // Default: 1 day
  });

  // Translations
  title = computed(() => this.translationService.t('sellProduct.title'));
  productNameLabel = computed(() => this.translationService.t('sellProduct.productName'));
  mainImageLabel = computed(() => this.translationService.t('sellProduct.mainImage'));
  additionalImagesLabel = computed(() => this.translationService.t('sellProduct.additionalImages'));
  startingPriceLabel = computed(() => this.translationService.t('sellProduct.startingPrice'));
  submitButton = computed(() => this.translationService.t('sellProduct.submit'));
  cancelButton = computed(() => this.translationService.t('sellProduct.cancel'));
  successMessage = computed(() => this.translationService.t('sellProduct.successMessage'));
  errorMessageText = computed(() => this.translationService.t('sellProduct.errorMessage'));
  selectMainImage = computed(() => this.translationService.t('sellProduct.selectMainImage'));
  removeMainImageText = computed(() => this.translationService.t('sellProduct.removeMainImage'));
  selectAdditionalImages = computed(() =>
    this.translationService.t('sellProduct.selectAdditionalImages'),
  );
  removeAdditionalImageText = computed(() =>
    this.translationService.t('sellProduct.removeAdditionalImage'),
  );
  required = computed(() => this.translationService.t('profile.required'));
  invalidPrice = computed(() => this.translationService.t('sellProduct.invalidPrice'));
  maxImages = computed(() => this.translationService.t('sellProduct.maxImages'));

  getDurationOptions() {
    return [
      { label: '1 ثانية', value: 1, en: '1 Second' },
      { label: '1 دقيقة', value: 60, en: '1 Minute' },
      { label: '1 ساعة', value: 3600, en: '1 Hour' },
      { label: '1 يوم', value: 86400, en: '1 Day' },
      { label: '3 أيام', value: 259200, en: '3 Days' },
      { label: '7 أيام', value: 604800, en: '7 Days' },
    ];
  }

  onMainImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.errorMessage.set(this.isArabic() ? 'يجب أن يكون الملف صورة' : 'File must be an image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set(
          this.isArabic()
            ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت'
            : 'Image size must be less than 5MB',
        );
        return;
      }

      this.mainImage.set(file);
      this.errorMessage.set(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.mainImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeMainImage() {
    this.mainImage.set(null);
    this.mainImagePreview.set(null);
    const input = document.getElementById('mainImage') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  onAdditionalImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      if (this.additionalImages().length + files.length > 9) {
        this.errorMessage.set(
          this.isArabic() ? 'الحد الأقصى 9 صور فرعية' : 'Maximum 9 additional images allowed',
        );
        return;
      }

      const validFiles: File[] = [];
      const previews: string[] = [];

      files.forEach((file) => {
        if (!file.type.startsWith('image/')) {
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          return;
        }

        validFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target?.result as string);
          if (previews.length === validFiles.length) {
            this.additionalImagesPreview.set([...this.additionalImagesPreview(), ...previews]);
          }
        };
        reader.readAsDataURL(file);
      });

      this.additionalImages.set([...this.additionalImages(), ...validFiles]);
      this.errorMessage.set(null);
    }
  }

  removeAdditionalImage(index: number) {
    const images = this.additionalImages();
    const previews = this.additionalImagesPreview();
    images.splice(index, 1);
    previews.splice(index, 1);
    this.additionalImages.set([...images]);
    this.additionalImagesPreview.set([...previews]);
  }

  onSubmit() {
    if (this.sellForm.invalid) {
      this.sellForm.markAllAsTouched();
      return;
    }

    if (!this.mainImage()) {
      this.errorMessage.set(this.isArabic() ? 'يجب اختيار صورة رئيسية' : 'Main image is required');
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
    formData.append('productName', this.sellForm.get('productName')?.value || '');
    formData.append('startingPrice', this.sellForm.get('startingPrice')?.value || '');
    formData.append('minBidIncrement', this.sellForm.get('minBidIncrement')?.value || '1');
    formData.append(
      'durationInSeconds',
      this.sellForm.get('durationInSeconds')?.value?.toString() || '86400',
    );

    if (this.mainImage()) {
      formData.append('images', this.mainImage()!);
    }

    this.additionalImages().forEach((image) => {
      formData.append('images', image);
    });

    this.http.post(`${environment.apiUrl}/auction-products`, formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showSuccessMessage.set(true);
        this.sellForm.reset();
        this.sellForm.patchValue({
          minBidIncrement: '1',
          durationInSeconds: 86400,
        }); // Reset to defaults
        this.removeMainImage();
        this.additionalImages.set([]);
        this.additionalImagesPreview.set([]);

        setTimeout(() => {
          this.showSuccessMessage.set(false);
          this.router.navigate(['/home']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.error?.message ||
            (this.isArabic() ? 'حدث خطأ أثناء إرسال المنتج' : 'Error submitting product'),
        );
      },
    });
  }
}
