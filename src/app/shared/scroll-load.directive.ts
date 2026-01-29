import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollLoad]',
  standalone: true,
})
export class ScrollLoadDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  @Input() scrollThreshold: number = 0.1; // 10% visibility threshold
  @Input() scrollRootMargin: string = '50px'; // Load 50px before visible
  @Input() scrollLoadOnce: boolean = true; // Only trigger once by default
  @Input() scrollDisabled: boolean = false;

  @Output() scrollVisible = new EventEmitter<boolean>();
  @Output() scrollLoad = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;
  private hasLoaded: boolean = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.scrollDisabled) {
      // If not in browser or disabled, emit immediately
      this.emitVisible();
      return;
    }

    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: this.scrollRootMargin,
      threshold: this.scrollThreshold,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (this.scrollLoadOnce && this.hasLoaded) {
            return;
          }

          this.hasLoaded = true;
          this.emitVisible();

          if (this.scrollLoadOnce) {
            this.disconnectObserver();
          }
        } else {
          if (!this.scrollLoadOnce) {
            this.scrollVisible.emit(false);
          }
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private emitVisible(): void {
    this.scrollVisible.emit(true);
    this.scrollLoad.emit();
  }

  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // Public method to manually trigger load
  public triggerLoad(): void {
    this.emitVisible();
  }

  // Public method to reset the directive
  public reset(): void {
    this.hasLoaded = false;
    if (this.observer) {
      this.observer.observe(this.el.nativeElement);
    } else {
      this.setupIntersectionObserver();
    }
  }
}
