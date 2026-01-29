import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../core/translation.service';
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

    console.log('Admin login attempt:', { email, password });

    // Check admin credentials
    if (email === 'admin@gmail.com' && password === '123456') {
      this.isLoading.set(true);
      this.error.set(null);

      // Simulate login delay
      setTimeout(() => {
        // Store admin session
        sessionStorage.setItem('adminAuthenticated', 'true');
        console.log('Admin authenticated, navigating to panel...');

        // Navigate to admin panel
        this.router
          .navigate(['/admin/panel'])
          .then((success) => {
            this.isLoading.set(false);
            if (success) {
              console.log('Navigation to admin panel successful');
            } else {
              console.error('Navigation failed');
              this.error.set(
                this.isArabic() ? 'حدث خطأ أثناء التوجيه' : 'Navigation error occurred',
              );
            }
          })
          .catch((err) => {
            console.error('Navigation error:', err);
            this.isLoading.set(false);
            this.error.set(this.isArabic() ? 'حدث خطأ أثناء التوجيه' : 'Navigation error occurred');
          });
      }, 500);
    } else {
      // Show error message
      const errorMsg = this.isArabic()
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        : 'Invalid email or password';
      console.log('Invalid credentials, showing error:', errorMsg);
      this.error.set(errorMsg);
      this.isLoading.set(false);
    }
  }
}
