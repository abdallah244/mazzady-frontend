import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../core/translation.service';
import { AuthService } from '../../auth/auth.service';
import { LoadingButtonDirective } from '../../shared/loading-button.directive';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingButtonDirective],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.sass',
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);

  isLoading = signal(false);
  error = signal<string | null>(null);

  adminForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isArabic = computed(() => this.translationService.isArabic());

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Clear previous error
    this.error.set(null);

    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const email = this.adminForm.get('email')?.value?.trim();
    const password = this.adminForm.get('password')?.value;

    if (!email || !password) return;

    this.isLoading.set(true);

    this.authService.adminLogin(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin/panel']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Admin login error:', err);
        const errorMsg = this.isArabic()
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'Invalid email or password';
        this.error.set(errorMsg);
      },
    });
  }
}
