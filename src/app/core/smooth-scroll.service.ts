import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SmoothScrollService {
  private platformId = inject(PLATFORM_ID);

  scrollToElement(elementId: string, offset: number = 80, duration: number = 600) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    const start = window.pageYOffset;
    const target = element.getBoundingClientRect().top + start - offset;
    const distance = target - start;
    let startTime: number | null = null;

    const easingFunction = (t: number): number => {
      // Ease-in-out cubic bezier
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const eased = easingFunction(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  scrollToTop(duration: number = 600) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const start = window.pageYOffset;
    const distance = -start;
    let startTime: number | null = null;

    const easingFunction = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const eased = easingFunction(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  scrollIntoView(element: HTMLElement, behavior: ScrollBehavior = 'smooth', block: ScrollLogicalPosition = 'start') {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    element.scrollIntoView({
      behavior,
      block,
      inline: 'nearest',
    });
  }
}
