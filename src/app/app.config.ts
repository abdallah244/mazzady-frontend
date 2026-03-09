import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading, withViewTransitions } from '@angular/router';
import { NetworkIdlePreloadStrategy } from './core/network-idle-preload.strategy';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(routes, withPreloading(NetworkIdlePreloadStrategy), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
