import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appSkeletonLoader]',
  standalone: true,
})
export class SkeletonLoaderDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() skeletonType: 'text' | 'card' | 'image' | 'avatar' | 'button' | 'custom' = 'text';
  @Input() skeletonWidth: string = '100%';
  @Input() skeletonHeight: string = '20px';
  @Input() skeletonRadius: string = '4px';
  @Input() skeletonLines: number = 1;
  @Input() skeletonDelay: number = 0;
  @Input() showSkeleton: boolean = true;

  private skeletonElement: HTMLElement | null = null;
  private originalDisplay: string = '';
  private timeoutId: any = null;

  ngOnInit(): void {
    if (this.showSkeleton) {
      this.createSkeleton();
    }
  }

  ngOnDestroy(): void {
    this.removeSkeleton();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private createSkeleton(): void {
    // Store original display
    this.originalDisplay = this.el.nativeElement.style.display || '';

    // Hide original content
    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');

    // Create skeleton container
    this.skeletonElement = this.renderer.createElement('div');
    this.renderer.addClass(this.skeletonElement, 'skeleton-loader');
    this.renderer.addClass(this.skeletonElement, `skeleton-${this.skeletonType}`);

    // Apply styles based on type
    this.applySkeletonStyles();

    // Insert skeleton before the original element
    const parent = this.el.nativeElement.parentNode;
    if (parent) {
      this.renderer.insertBefore(parent, this.skeletonElement, this.el.nativeElement);
    }

    // Add shimmer animation styles if not already present
    this.addGlobalStyles();
  }

  private applySkeletonStyles(): void {
    if (!this.skeletonElement) return;

    const baseStyles = {
      background:
        'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%)',
      'background-size': '200% 100%',
      animation: 'skeletonShimmer 1.5s infinite ease-in-out',
      'border-radius': this.skeletonRadius,
    };

    switch (this.skeletonType) {
      case 'text':
        this.createTextSkeleton(baseStyles);
        break;
      case 'card':
        this.createCardSkeleton(baseStyles);
        break;
      case 'image':
        this.createImageSkeleton(baseStyles);
        break;
      case 'avatar':
        this.createAvatarSkeleton(baseStyles);
        break;
      case 'button':
        this.createButtonSkeleton(baseStyles);
        break;
      default:
        this.applyStyles(this.skeletonElement, {
          ...baseStyles,
          width: this.skeletonWidth,
          height: this.skeletonHeight,
        });
    }
  }

  private createTextSkeleton(baseStyles: any): void {
    if (!this.skeletonElement) return;

    this.renderer.setStyle(this.skeletonElement, 'display', 'flex');
    this.renderer.setStyle(this.skeletonElement, 'flex-direction', 'column');
    this.renderer.setStyle(this.skeletonElement, 'gap', '8px');
    this.renderer.setStyle(this.skeletonElement, 'width', this.skeletonWidth);

    for (let i = 0; i < this.skeletonLines; i++) {
      const line = this.renderer.createElement('div');
      const width = i === this.skeletonLines - 1 && this.skeletonLines > 1 ? '60%' : '100%';
      this.applyStyles(line, {
        ...baseStyles,
        width: width,
        height: this.skeletonHeight,
      });
      this.renderer.appendChild(this.skeletonElement, line);
    }
  }

  private createCardSkeleton(baseStyles: any): void {
    if (!this.skeletonElement) return;

    this.renderer.setStyle(this.skeletonElement, 'width', this.skeletonWidth);
    this.renderer.setStyle(this.skeletonElement, 'padding', '16px');
    this.renderer.setStyle(this.skeletonElement, 'background', 'var(--bg-secondary)');
    this.renderer.setStyle(this.skeletonElement, 'border-radius', '8px');
    this.renderer.setStyle(this.skeletonElement, 'border', '1px solid var(--border-primary)');

    // Image placeholder
    const imgPlaceholder = this.renderer.createElement('div');
    this.applyStyles(imgPlaceholder, {
      ...baseStyles,
      width: '100%',
      height: '150px',
      'margin-bottom': '12px',
      'border-radius': '4px',
    });
    this.renderer.appendChild(this.skeletonElement, imgPlaceholder);

    // Title
    const title = this.renderer.createElement('div');
    this.applyStyles(title, {
      ...baseStyles,
      width: '80%',
      height: '20px',
      'margin-bottom': '8px',
    });
    this.renderer.appendChild(this.skeletonElement, title);

    // Description lines
    for (let i = 0; i < 2; i++) {
      const line = this.renderer.createElement('div');
      this.applyStyles(line, {
        ...baseStyles,
        width: i === 1 ? '60%' : '100%',
        height: '14px',
        'margin-bottom': '6px',
      });
      this.renderer.appendChild(this.skeletonElement, line);
    }
  }

  private createImageSkeleton(baseStyles: any): void {
    if (!this.skeletonElement) return;

    this.applyStyles(this.skeletonElement, {
      ...baseStyles,
      width: this.skeletonWidth,
      height: this.skeletonHeight,
      'border-radius': this.skeletonRadius,
    });
  }

  private createAvatarSkeleton(baseStyles: any): void {
    if (!this.skeletonElement) return;

    const size = this.skeletonWidth;
    this.applyStyles(this.skeletonElement, {
      ...baseStyles,
      width: size,
      height: size,
      'border-radius': '50%',
    });
  }

  private createButtonSkeleton(baseStyles: any): void {
    if (!this.skeletonElement) return;

    this.applyStyles(this.skeletonElement, {
      ...baseStyles,
      width: this.skeletonWidth,
      height: this.skeletonHeight || '40px',
      'border-radius': this.skeletonRadius || '4px',
    });
  }

  private applyStyles(element: HTMLElement, styles: { [key: string]: string }): void {
    Object.entries(styles).forEach(([key, value]) => {
      this.renderer.setStyle(element, key, value);
    });
  }

  private addGlobalStyles(): void {
    const styleId = 'skeleton-loader-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes skeletonShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .skeleton-loader {
        pointer-events: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  public hideSkeleton(): void {
    if (this.skeletonDelay > 0) {
      this.timeoutId = setTimeout(() => {
        this.removeSkeleton();
      }, this.skeletonDelay);
    } else {
      this.removeSkeleton();
    }
  }

  private removeSkeleton(): void {
    if (this.skeletonElement && this.skeletonElement.parentNode) {
      this.skeletonElement.parentNode.removeChild(this.skeletonElement);
      this.skeletonElement = null;
    }

    // Show original content
    if (this.originalDisplay) {
      this.renderer.setStyle(this.el.nativeElement, 'display', this.originalDisplay);
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'display');
    }

    this.showSkeleton = false;
  }
}
