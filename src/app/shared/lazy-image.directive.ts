import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, inject, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true,
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = '';
  @Input() placeholder: string = '';

  private platformId = inject(PLATFORM_ID);
  private renderer = inject(Renderer2);
  private observer?: IntersectionObserver;
  private imgElement?: HTMLImageElement;
  private loaded = false;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      // SSR: load immediately
      if (this.imgElement && this.appLazyLoad) {
        this.renderer.setAttribute(this.imgElement, 'src', this.appLazyLoad);
      }
      return;
    }

    this.imgElement = this.el.nativeElement as HTMLImageElement;

    // Set placeholder if provided
    if (this.placeholder && this.imgElement) {
      this.renderer.setAttribute(this.imgElement, 'src', this.placeholder);
      this.renderer.setStyle(this.imgElement, 'opacity', '0.6');
      this.renderer.setStyle(this.imgElement, 'transition', 'opacity 0.3s ease');
    }

    // Use native loading="lazy" if supported
    if ('loading' in HTMLImageElement.prototype && this.imgElement) {
      this.renderer.setAttribute(this.imgElement, 'loading', 'lazy');
      // Fallback: still use IntersectionObserver for better control
      this.setupIntersectionObserver();
    } else {
      // Fallback for older browsers
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver() {
    if (!this.imgElement || !('IntersectionObserver' in window)) {
      // Fallback: load immediately
      this.loadImage();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.loaded && this.appLazyLoad) {
            this.loadImage();
            if (this.observer && this.imgElement) {
              this.observer.unobserve(this.imgElement);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    if (this.imgElement) {
      this.observer.observe(this.imgElement);
    }
  }

  private loadImage() {
    if (!this.imgElement || !this.appLazyLoad || this.loaded) {
      return;
    }

    this.loaded = true;
    const img = new Image();

    img.onload = () => {
      if (this.imgElement) {
        this.renderer.setAttribute(this.imgElement, 'src', this.appLazyLoad);
        this.renderer.setStyle(this.imgElement, 'opacity', '1');
      }
    };

    img.onerror = () => {
      if (this.imgElement) {
        this.renderer.setStyle(this.imgElement, 'opacity', '1');
      }
    };

    img.src = this.appLazyLoad;
  }

  ngOnDestroy() {
    if (this.observer && this.imgElement) {
      this.observer.unobserve(this.imgElement);
      this.observer.disconnect();
    }
  }

  constructor(private el: ElementRef) {}
}
