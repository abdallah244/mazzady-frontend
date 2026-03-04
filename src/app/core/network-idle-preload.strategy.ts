import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { switchMap, delay } from 'rxjs/operators';

/**
 * Preloads lazy-loaded routes after a delay, allowing the initial page
 * to fully render before consuming bandwidth for preloading.
 * This significantly improves Speed Index and LCP.
 */
@Injectable({ providedIn: 'root' })
export class NetworkIdlePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Wait 4 seconds after initial load before starting to preload lazy routes
    // This prevents preloading from competing with critical resources
    return of(null).pipe(
      delay(4000),
      switchMap(() => load()),
    );
  }
}
