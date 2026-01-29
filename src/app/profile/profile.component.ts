import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../core/translation.service';
import { AuthService } from '../auth/auth.service';
import { LoadingButtonDirective } from '../shared/loading-button.directive';
import { environment } from '../../environments/environment';

interface ProfileData {
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
  walletBalance: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingButtonDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass',
})
export class ProfileComponent implements OnInit {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  profileData = signal<ProfileData | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  selectedAvatar: File | null = null;
  avatarPreview = signal<string | null>(null);
  showSuccessMessage = signal(false);
  errorMessage = signal<string | null>(null);
  showNationalIdModal = signal(false);
  hasNationalIdImages = computed(() => {
    const data = this.profileData();
    return !!(data?.nationalIdFrontUrl || data?.nationalIdBackUrl);
  });

  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    middleName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
  });

  // Translations
  isArabic = computed(() => this.translationService.isArabic());
  title = computed(() => this.translationService.t('profile.title'));
  firstName = computed(() => this.translationService.t('profile.firstName'));
  middleName = computed(() => this.translationService.t('profile.middleName'));
  lastName = computed(() => this.translationService.t('profile.lastName'));
  email = computed(() => this.translationService.t('profile.email'));
  nickname = computed(() => this.translationService.t('profile.nickname'));
  phone = computed(() => this.translationService.t('profile.phone'));
  nationalId = computed(() => this.translationService.t('profile.nationalId'));
  walletBalance = computed(() => this.translationService.t('profile.walletBalance'));
  profileImage = computed(() => this.translationService.t('profile.profileImage'));
  changeImage = computed(() => this.translationService.t('profile.changeImage'));
  save = computed(() => this.translationService.t('profile.save'));
  cancel = computed(() => this.translationService.t('profile.cancel'));
  back = computed(() => this.translationService.t('profile.back'));
  loading = computed(() => this.translationService.t('profile.loading'));
  saving = computed(() => this.translationService.t('profile.saving'));
  saveSuccess = computed(() => this.translationService.t('profile.saveSuccess'));
  saveError = computed(() => this.translationService.t('profile.saveError'));
  required = computed(() => this.translationService.t('profile.required'));
  invalidPhone = computed(() => this.translationService.t('profile.invalidPhone'));
  minLength = computed(() => this.translationService.t('profile.minLength'));

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile(currentUser.id);
  }

  loadProfile(userId: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.http.get<ProfileData>(`${environment.apiUrl}/auth/profile/${userId}`).subscribe({
      next: (data) => {
        this.profileData.set(data);
        this.profileForm.patchValue({
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          phone: data.phone,
        });
        if (data.profileImageUrl) {
          this.avatarPreview.set(`${environment.apiUrl}${data.profileImageUrl}`);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg =
          error.error?.message ||
          error.message ||
          (this.isArabic() ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading profile');
        this.errorMessage.set(errorMsg);
      },
    });
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set(
          this.isArabic() ? 'يجب اختيار صورة فقط' : 'Please select an image file',
        );
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set(
          this.isArabic()
            ? 'حجم الصورة يجب أن يكون أقل من 5MB'
            : 'Image size must be less than 5MB',
        );
        return;
      }

      this.selectedAvatar = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar() {
    this.selectedAvatar = null;
    const profileData = this.profileData();
    if (profileData?.profileImageUrl) {
      this.avatarPreview.set(`${environment.apiUrl}${profileData.profileImageUrl}`);
    } else {
      this.avatarPreview.set(null);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.showSuccessMessage.set(false);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const formData = this.profileForm.value;

    // First, update profile data
    this.http.put(`${environment.apiUrl}/auth/profile/${currentUser.id}`, formData).subscribe({
      next: (updatedProfile) => {
        // Then, upload avatar if selected
        if (this.selectedAvatar) {
          const avatarFormData = new FormData();
          avatarFormData.append('avatar', this.selectedAvatar);

          this.http
            .post(`${environment.apiUrl}/auth/profile/${currentUser.id}/avatar`, avatarFormData)
            .subscribe({
              next: (finalProfile) => {
                this.profileData.set(finalProfile as ProfileData);
                this.selectedAvatar = null;
                this.isSaving.set(false);
                this.showSuccessMessage.set(true);
                setTimeout(() => {
                  this.showSuccessMessage.set(false);
                }, 3000);
              },
              error: () => {
                this.isSaving.set(false);
                this.errorMessage.set(
                  this.isArabic()
                    ? 'تم تحديث البيانات لكن حدث خطأ أثناء رفع الصورة'
                    : 'Profile updated but error uploading avatar',
                );
              },
            });
        } else {
          this.profileData.set(updatedProfile as ProfileData);
          this.isSaving.set(false);
          this.showSuccessMessage.set(true);
          setTimeout(() => {
            this.showSuccessMessage.set(false);
          }, 3000);
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        const errorMsg =
          error.error?.message ||
          (this.isArabic() ? 'حدث خطأ أثناء تحديث البيانات' : 'Error updating profile');
        this.errorMessage.set(errorMsg);
      },
    });
  }

  onCancel() {
    const profileData = this.profileData();
    if (profileData) {
      this.profileForm.patchValue({
        firstName: profileData.firstName,
        middleName: profileData.middleName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      });
      this.removeAvatar();
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  retryLoad() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.errorMessage.set(null);
      this.loadProfile(currentUser.id);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return this.required();
      }
      if (field.errors?.['minlength']) {
        return this.minLength();
      }
      if (field.errors?.['pattern']) {
        return this.invalidPhone();
      }
    }
    return null;
  }

  openNationalIdModal() {
    if (this.hasNationalIdImages()) {
      this.showNationalIdModal.set(true);
    }
  }

  closeNationalIdModal() {
    this.showNationalIdModal.set(false);
  }

  getNationalIdImageUrl(side: 'front' | 'back'): string | null {
    const data = this.profileData();
    const path = side === 'front' ? data?.nationalIdFrontUrl : data?.nationalIdBackUrl;
    return path ? `${environment.apiUrl}${path}` : null;
  }
}
