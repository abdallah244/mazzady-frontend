import {
  Component,
  signal,
  inject,
  OnInit,
  OnDestroy,
  computed,
  effect,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { LoadingButtonDirective } from '../../shared/loading-button.directive';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';
import { loadGoogleSdk, loadFacebookSdk } from '../../core/social-auth-loader';

declare const google: any;
declare const FB: any;

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingButtonDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass',
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private ngZone = inject(NgZone);
  private subscriptions = new Subscription();
  private redirectInterval: any = null;

  currentStep = signal(1);
  totalSteps = 5;
  isExistingUser = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  reviewCarouselIndex = signal(0);
  verificationCodeSent = signal(false);
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isVerifyingCode = signal(false);
  redirectCountdown = signal(3);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  steps = computed(() => {
    const step = this.currentStep();
    return Array.from({ length: this.totalSteps }, (_, i) => ({
      number: i + 1,
      active: i + 1 === step,
      completed: i + 1 < step,
    }));
  });

  // Translations
  welcome = computed(() => this.translationService.t('login.welcome'));
  welcomeBack = computed(() => this.translationService.t('login.welcomeBack'));
  email = computed(() => this.translationService.t('login.email'));
  password = computed(() => this.translationService.t('login.password'));
  rememberMe = computed(() => this.translationService.t('login.rememberMe'));
  rememberMeInfo = computed(() => this.translationService.t('login.rememberMeInfo'));
  reviewInfo = computed(() => this.translationService.t('login.reviewInfo'));
  verifyCodeText = computed(() => this.translationService.t('login.verifyCode'));
  welcomeBackTitle = computed(() => this.translationService.t('login.welcomeBackTitle'));
  welcomeBackMessage = computed(() => this.translationService.t('login.welcomeBackMessage'));
  redirecting = computed(() => this.translationService.t('login.redirecting'));
  verifyAndLogin = computed(() => this.translationService.t('login.verifyAndLogin'));
  verifying = computed(() => this.translationService.t('login.verifying'));
  loggingIn = computed(() => this.translationService.t('login.loggingIn'));
  next = computed(() => this.translationService.t('common.next'));
  previous = computed(() => this.translationService.t('common.previous'));

  // Helper method for translation
  t(key: any, params?: Record<string, string | number>): string {
    return this.translationService.t(key, params);
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
    verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    const email = this.loginForm.get('email');
    if (email) {
      const emailSub = email.valueChanges.subscribe((value) => {
        if (value && email.valid) {
          this.checkUserExists(value);
        }
      });
      this.subscriptions.add(emailSub);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
    }
  }

  checkUserExists(email: string) {
    const sub = this.authService.checkUserExists(email).subscribe({
      next: (response) => {
        this.isExistingUser.set(response.exists);
      },
      error: () => {
        this.isExistingUser.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  nextStep() {
    const step = this.currentStep();
    if (step === 1) {
      const emailValid = this.loginForm.get('email')?.valid === true;
      if (emailValid) {
        this.currentStep.set(2);
        this.error.set(null);
      } else {
        this.loginForm.get('email')?.markAsTouched();
      }
    } else if (step === 2) {
      const passwordValid = this.loginForm.get('password')?.valid === true;
      if (passwordValid) {
        this.currentStep.set(3);
        this.error.set(null);
        this.reviewCarouselIndex.set(0);
      } else {
        this.loginForm.get('password')?.markAsTouched();
      }
    } else if (step === 3) {
      // Move to verification code step and send code
      this.currentStep.set(4);
      this.error.set(null);
      this.sendVerificationCode();
    }
  }

  getReviewData() {
    return {
      email: this.loginForm.get('email')?.value || '',
      rememberMe: this.loginForm.get('rememberMe')?.value || false,
    };
  }

  nextCarouselItem() {
    const currentIndex = this.reviewCarouselIndex();
    if (currentIndex < 1) {
      this.reviewCarouselIndex.set(currentIndex + 1);
    }
  }

  prevCarouselItem() {
    const currentIndex = this.reviewCarouselIndex();
    if (currentIndex > 0) {
      this.reviewCarouselIndex.set(currentIndex - 1);
    }
  }

  prevStep() {
    const step = this.currentStep();
    if (step > 1) {
      this.currentStep.set(step - 1);
      this.error.set(null);
      if (step === 4) {
        this.verificationCodeSent.set(false);
      }
    }
  }

  sendVerificationCode() {
    const email = this.loginForm.get('email')?.value;
    if (!email) return;

    this.isVerifyingCode.set(true);
    const sub = this.authService.sendVerificationCodeForLogin(email).subscribe({
      next: () => {
        this.verificationCodeSent.set(true);
        this.isVerifyingCode.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to send verification code');
        this.isVerifyingCode.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  verifyCode() {
    const code = this.loginForm.get('verificationCode')?.value;
    const email = this.loginForm.get('email')?.value;

    if (!code || !email) return;

    if (!this.loginForm.get('verificationCode')?.valid) {
      this.loginForm.get('verificationCode')?.markAsTouched();
      return;
    }

    this.isVerifyingCode.set(true);
    this.error.set(null);

    const sub = this.authService.verifyEmailCode(email, code).subscribe({
      next: (response) => {
        if (response.verified) {
          this.isVerifyingCode.set(false);
          // Proceed to login after verification
          this.performLogin();
        } else {
          this.error.set('Invalid verification code');
          this.isVerifyingCode.set(false);
        }
      },
      error: (err: any) => {
        this.error.set(err.error?.message || 'Verification failed');
        this.isVerifyingCode.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  performLogin() {
    this.isLoading.set(true);
    this.error.set(null);

    const { email, password, rememberMe } = this.loginForm.value;

    const sub = this.authService.login(email!, password!, rememberMe || false).subscribe({
      next: (response: any) => {
        // User is already set in the service via tap()
        this.isLoading.set(false);
        // Move to welcome back step (step 5)
        this.currentStep.set(5);
        this.startRedirectCountdown();
      },
      error: (err: any) => {
        this.error.set(err.error?.message || 'Login failed');
        this.isLoading.set(false);
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
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  onKeyPress(event: KeyboardEvent, action: 'next' | 'submit') {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (action === 'next') {
        this.nextStep();
      } else {
        this.onSubmit();
      }
    }
  }

  async loginWithGoogle() {
    this.error.set(null);
    this.isLoading.set(true);
    try {
      await loadGoogleSdk();
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            this.handleGoogleCredential(response.credential);
          });
        },
      });
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: show the One Tap popup as a button click
          google.accounts.id.renderButton(document.createElement('div'), { type: 'standard' });
          // Use popup mode instead
          google.accounts.oauth2.initCodeClient({
            client_id: environment.googleClientId,
            scope: 'email profile',
            callback: () => {},
          });
          // If One Tap is blocked, try the redirect flow
          this.ngZone.run(() => {
            this.isLoading.set(false);
            // Fallback to popup
            google.accounts.id.prompt();
          });
        }
      });
    } catch {
      this.isLoading.set(false);
      this.error.set('Google Sign-In is not available. Please try again.');
    }
  }

  private handleGoogleCredential(credential: string) {
    this.isLoading.set(true);
    this.error.set(null);
    const sub = this.authService.googleSignIn(credential).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.currentStep.set(5); // Success step
        this.startRedirectCountdown();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Google sign-in failed');
      },
    });
    this.subscriptions.add(sub);
  }

  async loginWithFacebook() {
    this.error.set(null);
    this.isLoading.set(true);
    try {
      await loadFacebookSdk();
      FB.init({
        appId: environment.facebookAppId,
        cookie: true,
        xfbml: false,
        version: 'v18.0',
      });
      FB.login(
        (response: any) => {
          this.ngZone.run(() => {
            if (response.authResponse) {
              this.handleFacebookToken(response.authResponse.accessToken);
            } else {
              this.isLoading.set(false);
              this.error.set('Facebook login was cancelled.');
            }
          });
        },
        { scope: 'email,public_profile' },
      );
    } catch {
      this.isLoading.set(false);
      this.error.set('Facebook Sign-In is not available. Please try again.');
    }
  }

  private handleFacebookToken(accessToken: string) {
    this.isLoading.set(true);
    this.error.set(null);
    const sub = this.authService.facebookSignIn(accessToken).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.currentStep.set(5);
        this.startRedirectCountdown();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Facebook sign-in failed');
      },
    });
    this.subscriptions.add(sub);
  }

  onSubmit() {
    // If we're on step 4, we need to verify code first
    if (this.currentStep() === 4) {
      this.verifyCode();
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.get('password')?.markAsTouched();
      return;
    }

    this.performLogin();
  }

  goToAdminLogin() {
    this.router.navigate(['/admin/login']);
  }
}
