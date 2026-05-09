import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  const hasToken = !!sessionStorage.getItem('adminToken');

  if (!isAuthenticated || !hasToken) {
    router.navigate(['/admin/login']);
    return false;
  }

  return true;
};

