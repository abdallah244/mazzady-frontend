import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);

  // Skip auth header for public endpoints
  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/send-verification-code',
    '/auth/verify-email-code',
    '/auth/check-user',
    '/auth/check-nickname',
    '/auth/check-phone',
    '/auth/check-national-id',
    '/auth/google',
    '/auth/facebook',
    '/auth/refresh-token',
  ];

  const isPublicEndpoint = publicEndpoints.some((endpoint) => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    return next(req);
  }

  // Add JWT token to request
  const token = authService.getAccessToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401 Unauthorized, try to refresh token
        if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
          return authService.refreshAccessToken().pipe(
            switchMap((response) => {
              // Retry with new token
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`,
                },
              });
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, logout user
              authService.logout();
              return throwError(() => refreshError);
            }),
          );
        }
        return throwError(() => error);
      }),
    );
  }

  return next(req);
};
