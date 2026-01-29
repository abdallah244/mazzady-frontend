import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ViewTransitionService {
  private platformId = inject(PLATFORM_ID);

  /**
   * Check if View Transitions API is supported
   */
  isSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return 'startViewTransition' in document;
  }

  /**
   * Start a view transition
   */
  startTransition(callback: () => void | Promise<void>): void {
    if (!this.isSupported()) {
      callback();
      return;
    }

    try {
      // @ts-ignore - View Transitions API might not be in TypeScript types
      document.startViewTransition(callback);
    } catch (error) {
      // Fallback if API fails
      callback();
    }
  }

  /**
   * Set view transition name for an element
   */
  setName(element: HTMLElement | null, name: string): void {
    if (!element || !isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.isSupported()) {
      element.style.viewTransitionName = name;
    }
  }

  /**
   * Remove view transition name from an element
   */
  removeName(element: HTMLElement | null): void {
    if (!element || !isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.isSupported()) {
      element.style.viewTransitionName = 'none';
    }
  }
}
