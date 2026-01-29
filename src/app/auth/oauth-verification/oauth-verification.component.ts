import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { LoadingButtonDirective } from '../../shared/loading-button.directive';

@Component({
  selector: 'app-oauth-verification',
  imports: [CommonModule, ReactiveFormsModule, LoadingButtonDirective],
  templateUrl: './oauth-verification.component.html',
  styleUrl: './oauth-verification.component.sass',
})
export class OAuthVerificationComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscriptions = new Subscription();

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  email = signal<string>('');
  provider = signal<'google' | 'facebook'>('google');
  userInfo = signal<any>(null);
  verificationCodeSent = signal(false);

  verificationForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  ngOnInit() {
    // Get query parameters
    const sub = this.route.queryParams.subscribe((params) => {
      if (params['error']) {
        this.error.set(decodeURIComponent(params['error']));
        return;
      }

      if (params['email']) {
        this.email.set(decodeURIComponent(params['email']));
        this.verificationCodeSent.set(true);
      }

      if (params['provider']) {
        this.provider.set(params['provider'] as 'google' | 'facebook');
      }

      if (params['userInfo']) {
        try {
          this.userInfo.set(JSON.parse(decodeURIComponent(params['userInfo'])));
        } catch (e) {
          console.error('Error parsing userInfo:', e);
        }
      }

      // If user already exists (has id), redirect to success
      if (params['user']) {
        try {
          const user = JSON.parse(decodeURIComponent(params['user']));
          if (user.id) {
            this.authService.setUser(user, true);
            this.router.navigate(['/home']);
            return;
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  verifyCode() {
    console.log('verifyCode() called');
    console.log('Form valid:', this.verificationForm.valid);
    console.log('Form value:', this.verificationForm.value);

    if (this.verificationForm.invalid) {
      console.log('Form is invalid');
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const code = this.verificationForm.get('code')?.value;
    const email = this.email();
    const provider = this.provider();
    const userInfo = this.userInfo();

    console.log('Data check:', { code, email, provider, userInfo });

    if (!code || !email || !provider) {
      console.error('Missing required information:', { code, email, provider });
      this.error.set('Missing required information');
      this.isLoading.set(false);
      return;
    }

    // If userInfo is missing, create a basic one from email
    const finalUserInfo = userInfo || {
      name: email.split('@')[0],
      email: email,
    };

    console.log('Calling verifyOAuthCode API:', { email, code, provider, userInfo: finalUserInfo });

    const sub = this.authService.verifyOAuthCode(email, code, provider, finalUserInfo).subscribe({
      next: (response) => {
        console.log('✅ OAuth verification success:', response);
        this.isLoading.set(false);
        this.success.set(true);

        // Set user and redirect after 2 seconds
        if (response && response.user) {
          console.log('Setting user:', response.user);
          this.authService.setUser(response.user, true);
          setTimeout(() => {
            console.log('Redirecting to home...');
            this.router.navigate(['/home']);
          }, 2000);
        } else {
          console.error('❌ User data not received in response:', response);
          this.error.set('User data not received');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('❌ OAuth verification error:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
        });
        this.isLoading.set(false);
        this.error.set(err.error?.message || err.message || 'Verification failed');
      },
    });
    this.subscriptions.add(sub);
  }

  resendCode() {
    const email = this.email();
    if (!email) {
      this.error.set('Email not found');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // For OAuth, use regular sendVerificationCode (not forLogin)
    const sub = this.authService.sendVerificationCode(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.verificationCodeSent.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to resend code');
      },
    });
    this.subscriptions.add(sub);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.verifyCode();
    }
  }
}
