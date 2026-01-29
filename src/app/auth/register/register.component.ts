import { Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { LoadingButtonDirective } from '../../shared/loading-button.directive';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';

type PasswordStrength = 'weak' | 'medium' | 'strong';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingButtonDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.sass',
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private subscriptions = new Subscription();
  private codeExpiryTimer: any = null;
  private resendCooldownTimer: any = null;

  currentStep = signal(1);
  totalSteps = 8;
  emailVerified = signal(false);
  verificationCodeSent = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isSubmitting = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<PasswordStrength>('weak');
  codeExpiryTime = signal(600); // 10 minutes in seconds
  resendCooldown = signal(0); // Cooldown in seconds
  reviewCarouselIndex = signal(0);
  redirectCountdown = signal(3);
  redirectInterval: any = null;
  nationalIdFrontPreview = signal<string | null>(null);
  nationalIdBackPreview = signal<string | null>(null);
  nationalIdImageError = signal<string | null>(null);

  isArabic = computed(() => this.translationService.isArabic());

  steps = computed(() => {
    const step = this.currentStep();
    return Array.from({ length: this.totalSteps }, (_, i) => ({
      number: i + 1,
      active: i + 1 === step,
      completed: i + 1 < step,
    }));
  });

  // Translations
  welcome = computed(() => this.translationService.t('register.welcome'));
  personalInfo = computed(() => this.translationService.t('register.personalInfo'));
  fullName = computed(() => this.translationService.t('register.fullName'));
  firstName = computed(() => this.translationService.t('register.firstName'));
  middleName = computed(() => this.translationService.t('register.middleName'));
  lastName = computed(() => this.translationService.t('register.lastName'));
  nickname = computed(() => this.translationService.t('register.nickname'));
  phoneNumber = computed(() => this.translationService.t('register.phoneNumber'));
  nationalId = computed(() => this.translationService.t('register.nationalId'));
  email = computed(() => this.translationService.t('register.email'));
  verifyEmail = computed(() => this.translationService.t('register.verifyEmail'));
  verificationCode = computed(() => this.translationService.t('register.verificationCode'));
  password = computed(() => this.translationService.t('register.password'));
  confirmPassword = computed(() => this.translationService.t('register.confirmPassword'));
  reviewInfo = computed(() => this.translationService.t('register.reviewInfo'));
  success = computed(() => this.translationService.t('register.success'));
  successMessage = computed(() => this.translationService.t('register.successMessage'));
  redirecting = computed(() => this.translationService.t('register.redirecting'));
  goToLoginText = computed(() => this.translationService.t('register.goToLogin'));
  next = computed(() => this.translationService.t('common.next'));
  previous = computed(() => this.translationService.t('common.previous'));
  confirm = computed(() => this.translationService.t('common.submit'));

  registerForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      nickname: [
        '',
        [Validators.required, Validators.minLength(3)],
        [this.nicknameValidator.bind(this)],
      ],
      phone: [
        '',
        [Validators.required, this.egyptianPhoneValidator],
        [this.phoneValidator.bind(this)],
      ],
      nationalId: [
        '',
        [Validators.required, this.egyptianNationalIdValidator],
        [this.nationalIdValidator.bind(this)],
      ],
      nationalIdFront: this.fb.control<File | null>(null, [Validators.required]),
      nationalIdBack: this.fb.control<File | null>(null, [Validators.required]),
      email: ['', [Validators.required, Validators.email], [this.emailValidator.bind(this)]],
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  egyptianPhoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const phone = control.value.replace(/\s+/g, '').replace(/-/g, '');
    // Egyptian phone numbers: +20 1XX XXXX XXXX or 01X XXXX XXXX
    const egyptianPhoneRegex = /^(?:\+20|0020|0)?1[0-2,5]\d{8}$/;
    return egyptianPhoneRegex.test(phone) ? null : { invalidEgyptianPhone: true };
  }

  egyptianNationalIdValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const nationalId = control.value.replace(/\s+/g, '').replace(/-/g, '');
    // Egyptian National ID: exactly 14 digits, starting with 2 or 3
    const egyptianNationalIdRegex = /^[23]\d{13}$/;
    return egyptianNationalIdRegex.test(nationalId) ? null : { invalidEgyptianNationalId: true };
  }

  nicknameValidator(
    control: AbstractControl,
  ): Promise<ValidationErrors | null> | ValidationErrors | null {
    if (!control.value || control.value.length < 3) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      const subscription = this.authService.checkNicknameExists(control.value).subscribe({
        next: (response) => {
          resolve(response.exists ? { nicknameExists: true } : null);
          subscription.unsubscribe();
        },
        error: () => {
          resolve(null);
          subscription.unsubscribe();
        },
      });
    });
  }

  emailValidator(
    control: AbstractControl,
  ): Promise<ValidationErrors | null> | ValidationErrors | null {
    if (!control.value || !control.value.includes('@')) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      const subscription = this.authService.checkUserExists(control.value).subscribe({
        next: (response) => {
          resolve(response.exists ? { emailExists: true } : null);
          subscription.unsubscribe();
        },
        error: () => {
          resolve(null);
          subscription.unsubscribe();
        },
      });
    });
  }

  nationalIdValidator(
    control: AbstractControl,
  ): Promise<ValidationErrors | null> | ValidationErrors | null {
    if (!control.value) {
      return Promise.resolve(null);
    }
    const nationalId = control.value.replace(/\s+/g, '').replace(/-/g, '');
    // First check if it's a valid Egyptian national ID
    const egyptianNationalIdRegex = /^[23]\d{13}$/;
    if (!egyptianNationalIdRegex.test(nationalId)) {
      return Promise.resolve(null); // Let the sync validator handle this
    }
    return new Promise((resolve) => {
      const subscription = this.authService.checkNationalIdExists(nationalId).subscribe({
        next: (response) => {
          resolve(response.exists ? { nationalIdExists: true } : null);
          subscription.unsubscribe();
        },
        error: () => {
          resolve(null);
          subscription.unsubscribe();
        },
      });
    });
  }

  phoneValidator(
    control: AbstractControl,
  ): Promise<ValidationErrors | null> | ValidationErrors | null {
    if (!control.value) {
      return Promise.resolve(null);
    }
    const phone = control.value.replace(/\s+/g, '').replace(/-/g, '');
    // First check if it's a valid Egyptian phone
    const egyptianPhoneRegex = /^(?:\+20|0020|0)?1[0-2,5]\d{8}$/;
    if (!egyptianPhoneRegex.test(phone)) {
      return Promise.resolve(null); // Let the sync validator handle this
    }
    return new Promise((resolve) => {
      const subscription = this.authService.checkPhoneExists(phone).subscribe({
        next: (response) => {
          resolve(response.exists ? { phoneExists: true } : null);
          subscription.unsubscribe();
        },
        error: () => {
          resolve(null);
          subscription.unsubscribe();
        },
      });
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  getFormData() {
    const form = this.registerForm.value;
    return {
      firstName: form.firstName || '',
      middleName: form.middleName || '',
      lastName: form.lastName || '',
      nickname: form.nickname || '',
      phone: form.phone?.replace(/\s+/g, '') || '',
      nationalId: form.nationalId?.replace(/\s+/g, '') || '',
      email: form.email || '',
      password: form.password || '',
    };
  }

  onNationalIdImageSelected(event: Event, side: 'front' | 'back') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const controlName = side === 'front' ? 'nationalIdFront' : 'nationalIdBack';

    if (!file) {
      this.registerForm.get(controlName)?.setValue(null);
      this.registerForm.get(controlName)?.markAsTouched();
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.nationalIdImageError.set(
        this.isArabic()
          ? 'يجب رفع صورة للبطاقة (ملف صورة فقط)'
          : 'Please upload an image file for the national ID',
      );
      this.registerForm.get(controlName)?.setValue(null);
      this.registerForm.get(controlName)?.markAsTouched();
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.nationalIdImageError.set(
        this.isArabic()
          ? 'الحد الأقصى لحجم صورة البطاقة هو 2 ميجا'
          : 'National ID image size must be 2MB or less',
      );
      this.registerForm.get(controlName)?.setValue(null);
      this.registerForm.get(controlName)?.markAsTouched();
      return;
    }

    this.nationalIdImageError.set(null);
    this.registerForm.get(controlName)?.setValue(file);
    this.registerForm.get(controlName)?.markAsDirty();
    this.registerForm.get(controlName)?.markAsTouched();

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (side === 'front') {
        this.nationalIdFrontPreview.set(result);
      } else {
        this.nationalIdBackPreview.set(result);
      }
    };
    reader.readAsDataURL(file);
  }

  nextStep() {
    const step = this.currentStep();
    let isValid = false;

    switch (step) {
      case 1:
        isValid = !!(
          this.registerForm.get('firstName')?.valid &&
          this.registerForm.get('middleName')?.valid &&
          this.registerForm.get('lastName')?.valid &&
          this.registerForm.get('nickname')?.valid
        );
        break;
      case 2:
        isValid = this.registerForm.get('phone')?.valid === true;
        break;
      case 3:
        {
          const frontFile = this.registerForm.get('nationalIdFront')?.value;
          const backFile = this.registerForm.get('nationalIdBack')?.value;
          const hasImages = !!(frontFile && backFile);

          if (!hasImages) {
            this.nationalIdImageError.set(
              this.isArabic()
                ? 'يرجى رفع صورتي البطاقة (الوجه والخلف) بحد أقصى 2 ميجا لكل صورة'
                : 'Please upload both national ID images (front and back), max 2MB each',
            );
          } else {
            this.nationalIdImageError.set(null);
          }

          isValid = this.registerForm.get('nationalId')?.valid === true && hasImages;
        }
        break;
      case 4:
        const emailControl = this.registerForm.get('email');
        isValid = emailControl?.valid === true && emailControl?.pending === false;
        if (isValid && !this.verificationCodeSent()) {
          this.sendVerificationCode();
        }
        break;
      case 5:
        // Verification code step - user should click verify button, not next
        isValid = false;
        break;
      case 6:
        isValid =
          !!(
            this.registerForm.get('password')?.valid &&
            this.registerForm.get('confirmPassword')?.valid
          ) && !this.registerForm.hasError('passwordMismatch');
        break;
      case 7:
        isValid = true;
        break;
    }

    if (isValid && step < this.totalSteps) {
      this.currentStep.set(step + 1);
      this.error.set(null);
    } else {
      this.markStepFieldsAsTouched(step);
    }
  }

  prevStep() {
    const step = this.currentStep();
    if (step > 1) {
      this.currentStep.set(step - 1);
      this.error.set(null);
    }
  }

  markStepFieldsAsTouched(step: number) {
    switch (step) {
      case 1:
        this.registerForm.get('firstName')?.markAsTouched();
        this.registerForm.get('middleName')?.markAsTouched();
        this.registerForm.get('lastName')?.markAsTouched();
        this.registerForm.get('nickname')?.markAsTouched();
        break;
      case 2:
        this.registerForm.get('phone')?.markAsTouched();
        break;
      case 3:
        this.registerForm.get('nationalId')?.markAsTouched();
        this.registerForm.get('nationalIdFront')?.markAsTouched();
        this.registerForm.get('nationalIdBack')?.markAsTouched();
        break;
      case 4:
        this.registerForm.get('email')?.markAsTouched();
        break;
      case 5:
        this.registerForm.get('verificationCode')?.markAsTouched();
        break;
      case 6:
        this.registerForm.get('password')?.markAsTouched();
        this.registerForm.get('confirmPassword')?.markAsTouched();
        break;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.markStepFieldsAsTouched(this.currentStep());
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = this.getFormData();
    const frontFile = this.registerForm.get('nationalIdFront')?.value as File | null;
    const backFile = this.registerForm.get('nationalIdBack')?.value as File | null;

    if (!frontFile || !backFile) {
      this.isSubmitting.set(false);
      this.nationalIdImageError.set(
        this.isArabic()
          ? 'يرجى رفع صورتي البطاقة (الوجه والخلف) بحد أقصى 2 ميجا لكل صورة'
          : 'Please upload both national ID images (front and back), max 2MB each',
      );
      this.currentStep.set(3);
      this.markStepFieldsAsTouched(3);
      return;
    }

    const payload = new FormData();
    payload.append('email', formData.email);
    payload.append('password', formData.password);
    payload.append('firstName', formData.firstName);
    payload.append('middleName', formData.middleName);
    payload.append('lastName', formData.lastName);
    payload.append('nickname', formData.nickname);
    payload.append('phone', formData.phone);
    payload.append('nationalId', formData.nationalId);
    payload.append('nationalIdFront', frontFile);
    payload.append('nationalIdBack', backFile);

    const sub = this.authService.register(payload).subscribe({
      next: () => {
        this.currentStep.set(8);
        this.isSubmitting.set(false);
        this.startRedirectCountdown();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed');
        this.isSubmitting.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  startRedirectCountdown() {
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
    }
    this.redirectCountdown.set(3);
    this.redirectInterval = setInterval(() => {
      const countdown = this.redirectCountdown();
      if (countdown > 1) {
        this.redirectCountdown.set(countdown - 1);
      } else {
        clearInterval(this.redirectInterval);
        this.redirectInterval = null;
        this.goToLogin();
      }
    }, 1000);
  }

  nextCarouselItem() {
    const currentIndex = this.reviewCarouselIndex();
    const maxIndex = 4; // 5 items (name, nickname, phone, nationalId, email)
    if (currentIndex < maxIndex) {
      this.reviewCarouselIndex.set(currentIndex + 1);
    }
  }

  prevCarouselItem() {
    const currentIndex = this.reviewCarouselIndex();
    if (currentIndex > 0) {
      this.reviewCarouselIndex.set(currentIndex - 1);
    }
  }

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    // Watch password changes to calculate strength
    const passwordControl = this.registerForm.get('password');
    if (passwordControl) {
      const passwordSub = passwordControl.valueChanges.subscribe((value) => {
        this.passwordStrength.set(this.calculatePasswordStrength(value || ''));
      });
      this.subscriptions.add(passwordSub);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.codeExpiryTimer) {
      clearInterval(this.codeExpiryTimer);
    }
    if (this.resendCooldownTimer) {
      clearInterval(this.resendCooldownTimer);
    }
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
    }
  }

  calculatePasswordStrength(password: string): PasswordStrength {
    if (password.length < 6) return 'weak';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onKeyPress(event: KeyboardEvent, action: 'next' | 'verify' | 'submit') {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (action === 'next') {
        this.nextStep();
      } else if (action === 'verify') {
        this.verifyCode();
      } else {
        this.onSubmit();
      }
    }
  }

  sendVerificationCode() {
    const email = this.registerForm.get('email')?.value;
    if (!email) return;

    // Check cooldown
    if (this.resendCooldown() > 0) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const sub = this.authService.sendVerificationCode(email).subscribe({
      next: () => {
        this.verificationCodeSent.set(true);
        this.isLoading.set(false);
        this.startCodeExpiryTimer();
        this.startResendCooldown();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to send verification code');
        this.isLoading.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  startCodeExpiryTimer() {
    if (this.codeExpiryTimer) {
      clearInterval(this.codeExpiryTimer);
    }
    this.codeExpiryTime.set(600); // 10 minutes
    this.codeExpiryTimer = setInterval(() => {
      const time = this.codeExpiryTime();
      if (time > 0) {
        this.codeExpiryTime.set(time - 1);
      } else {
        clearInterval(this.codeExpiryTimer);
        this.codeExpiryTimer = null;
      }
    }, 1000);
  }

  startResendCooldown() {
    if (this.resendCooldownTimer) {
      clearInterval(this.resendCooldownTimer);
    }
    this.resendCooldown.set(60); // 60 seconds
    this.resendCooldownTimer = setInterval(() => {
      const cooldown = this.resendCooldown();
      if (cooldown > 0) {
        this.resendCooldown.set(cooldown - 1);
      } else {
        clearInterval(this.resendCooldownTimer);
        this.resendCooldownTimer = null;
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  verifyCode() {
    const email = this.registerForm.get('email')?.value;
    const code = this.registerForm.get('verificationCode')?.value;

    if (!email || !code) return;

    if (!this.registerForm.get('verificationCode')?.valid) {
      this.registerForm.get('verificationCode')?.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const sub = this.authService.verifyEmailCode(email, code).subscribe({
      next: (response) => {
        if (response.verified) {
          this.emailVerified.set(true);
          if (this.codeExpiryTimer) {
            clearInterval(this.codeExpiryTimer);
            this.codeExpiryTimer = null;
          }
          // Move to next step (password step)
          this.currentStep.set(6);
        } else {
          this.error.set('Invalid verification code');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Invalid verification code');
        this.isLoading.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  registerWithGoogle() {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  registerWithFacebook() {
    window.location.href = `${environment.apiUrl}/auth/facebook`;
  }

  // Helper method for translation with params
  t(key: any, params?: Record<string, string | number>): string {
    return this.translationService.t(key, params);
  }
}
