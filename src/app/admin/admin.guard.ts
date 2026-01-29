import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

  if (!isAuthenticated) {
    router.navigate(['/admin/login']);
    return false;
  }

  return true;
};

