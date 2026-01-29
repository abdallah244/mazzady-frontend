import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  inject,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { LoadingService } from '../core/loading.service';

@Directive({
  selector: '[appLoadingButton]',
  standalone: true,
})
export class LoadingButtonDirective implements OnChanges, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private loadingService = inject(LoadingService);
  private originalContent: string = '';
  private spinnerElement: HTMLElement | null = null;
  private isButtonLoading = false;
  private timeoutId: any = null;

  // Set to true to show loading, false to hide
  @Input() appLoadingButton: boolean | string | null = null;

  // Control loading state externally - THIS IS THE PRIMARY WAY TO CONTROL LOADING
  @Input() loading: boolean = false;

  // Maximum loading time (default: 30 seconds - safety timeout only)
  // This is just a safety fallback, not the actual loading control
  @Input() loadingTimeout: number = 30000;

  // Disable auto-loading on click (default: true for manual control)
  @Input() manualLoading: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading']) {
      const button = this.el.nativeElement as HTMLElement;
      if (this.loading) {
        this.startLoading(button);
        // Safety timeout to prevent stuck buttons (30 seconds default)
        this.timeoutId = setTimeout(() => {
          this.stopLoading(button);
        }, this.loadingTimeout);
      } else {
        this.stopLoading(button);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    // Manual loading is now the default - don't auto-start loading on click
    if (this.manualLoading) {
      return;
    }

    // Check if directive is disabled
    if (this.appLoadingButton === false || this.appLoadingButton === 'false') {
      return;
    }

    if (this.isButtonLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Only auto-start if manualLoading is explicitly set to false
    const button = this.el.nativeElement as HTMLButtonElement;
    if (button.tagName === 'BUTTON' || button.tagName === 'A') {
      this.startLoading(button);

      // Safety timeout
      this.timeoutId = setTimeout(() => {
        this.stopLoading(button);
      }, this.loadingTimeout);
    }
  }

  private startLoading(button: HTMLElement) {
    if (this.isButtonLoading) return;

    this.isButtonLoading = true;
    this.originalContent = button.innerHTML;

    // Disable button
    this.renderer.setAttribute(button, 'disabled', 'true');
    button.style.pointerEvents = 'none';
    button.style.opacity = '0.7';
    button.style.cursor = 'wait';

    // Create spinner
    this.spinnerElement = this.renderer.createElement('span');
    if (this.spinnerElement) {
      this.spinnerElement.className = 'button-spinner';
      this.spinnerElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // Clear button content and add spinner
      button.innerHTML = '';
      this.renderer.appendChild(button, this.spinnerElement);
    }

    // Start loading progress
    this.loadingService.startLoading();
    this.loadingService.simulateProgress();
  }

  private stopLoading(button: HTMLElement) {
    if (!this.isButtonLoading) return;

    this.isButtonLoading = false;
    this.loadingService.stopLoading();

    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Remove spinner
    if (this.spinnerElement) {
      this.renderer.removeChild(button, this.spinnerElement);
      this.spinnerElement = null;
    }

    // Restore original content
    button.innerHTML = this.originalContent;

    // Re-enable button
    this.renderer.removeAttribute(button, 'disabled');
    button.style.pointerEvents = 'auto';
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
  }

  // Public method to manually stop loading
  public forceStopLoading(): void {
    const button = this.el.nativeElement as HTMLElement;
    this.stopLoading(button);
  }
}
