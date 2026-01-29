import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  effect,
  signal,
  computed,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingService } from './core/loading.service';
import { FloatingMenuComponent } from './shared/floating-menu/floating-menu.component';
import { TranslationService } from './core/translation.service';
import { ThemeService } from './core/theme.service';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ChatbotComponent } from './shared/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    FloatingMenuComponent,
    NavbarComponent,
    FooterComponent,
    ChatbotComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.sass',
})
export class App implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  public translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();

  progress$ = this.loadingService.progress$;
  isLoading$ = this.loadingService.isLoading$;
  currentRoute = signal<string>('');
  isAnimating = signal<boolean>(false);
  previousRoute = signal<string>('');

  // Language for template access
  currentLanguage = computed(() => this.translationService.language());

  @ViewChild('routeContainer', { static: false }) routeContainer?: ElementRef<HTMLElement>;

  showNavbarAndFooter = computed(() => {
    const route = this.currentRoute();
    return (
      route !== '/login' &&
      route !== '/register' &&
      !route.startsWith('/auth/') &&
      !route.startsWith('/admin/')
    );
  });

  isAdminRoute = computed(() => {
    return this.currentRoute().startsWith('/admin/');
  });

  showFloatingMenu = computed(() => {
    return !this.isAdminRoute();
  });

  chatbotOpen = signal(false);

  constructor() {
    // Update HTML dir and lang attributes when language changes
    effect(() => {
      const lang = this.translationService.language();
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    });

    // Theme service is initialized in its constructor
    // It will automatically apply the theme on initialization
  }

  ngOnInit() {
    // Set initial route
    this.currentRoute.set(this.router.url);

    // Listen to router events for page transitions
    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.previousRoute.set(this.currentRoute());
        this.isAnimating.set(true);
        this.loadingService.simulateProgress();
        this.cdr.detectChanges();
      } else if (event instanceof NavigationEnd) {
        this.loadingService.stopLoading();
        this.currentRoute.set(event.urlAfterRedirects);

        // Force change detection first
        this.cdr.detectChanges();

        // Trigger page transition animation with multiple attempts
        setTimeout(() => {
          this.triggerPageTransition();
        }, 10);

        // Reset animation after transition completes
        setTimeout(() => {
          this.isAnimating.set(false);
        }, 450);
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loadingService.stopLoading();
        this.isAnimating.set(false);
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.add(routerSub);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();

    // Setup MutationObserver to watch for route component changes
    setTimeout(() => {
      this.setupRouteObserver();
    }, 100);
  }

  private setupRouteObserver() {
    if (!this.routeContainer?.nativeElement) {
      return;
    }

    const container = this.routeContainer.nativeElement;
    const routerOutlet = container.querySelector('router-outlet');

    if (!routerOutlet) {
      return;
    }

    let lastComponent: HTMLElement | null = null;

    // Create observer to watch for new components
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (
              element.tagName !== 'SCRIPT' &&
              element.tagName !== 'STYLE' &&
              element.tagName !== 'ROUTER-OUTLET' &&
              element !== routerOutlet &&
              element !== lastComponent
            ) {
              lastComponent = element;

              // New component added, apply animation
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  this.applyPageAnimation(element);
                });
              });
            }
          }
        });
      });
    });

    // Observe the container for child additions
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Store observer for cleanup
    (this as any)._routeObserver = observer;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    // Cleanup MutationObserver
    if ((this as any)._routeObserver) {
      (this as any)._routeObserver.disconnect();
    }
  }

  private triggerPageTransition() {
    // Use MutationObserver to watch for new components
    if (!this.routeContainer?.nativeElement) {
      return;
    }

    const container = this.routeContainer.nativeElement;
    const routerOutlet = container.querySelector('router-outlet');

    if (!routerOutlet) {
      return;
    }

    // Function to find and animate the active component
    const findAndAnimate = () => {
      // Try multiple methods to find the component
      let activeComponent: HTMLElement | null = null;

      // Method 1: Next sibling
      activeComponent = routerOutlet.nextElementSibling as HTMLElement;

      // Method 2: First child that's not router-outlet
      if (
        !activeComponent ||
        activeComponent.tagName === 'SCRIPT' ||
        activeComponent.tagName === 'STYLE'
      ) {
        const children = Array.from(container.children);
        activeComponent =
          (children.find(
            (el: any) =>
              el !== routerOutlet &&
              el.tagName !== 'SCRIPT' &&
              el.tagName !== 'STYLE' &&
              el.tagName !== 'ROUTER-OUTLET',
          ) as HTMLElement) || null;
      }

      // Method 3: Query selector
      if (
        !activeComponent ||
        activeComponent.tagName === 'SCRIPT' ||
        activeComponent.tagName === 'STYLE'
      ) {
        const found = container.querySelector(
          '*:not(router-outlet):not(script):not(style)',
        ) as HTMLElement;
        if (found && found !== routerOutlet) {
          activeComponent = found;
        }
      }

      if (
        activeComponent &&
        activeComponent.tagName !== 'SCRIPT' &&
        activeComponent.tagName !== 'STYLE' &&
        activeComponent.tagName !== 'ROUTER-OUTLET'
      ) {
        this.applyPageAnimation(activeComponent);
        return true;
      }
      return false;
    };

    // Try immediately with multiple attempts
    let attempts = 0;
    const maxAttempts = 15;

    const tryFind = () => {
      attempts++;
      if (findAndAnimate()) {
        return; // Found and animated
      }

      if (attempts < maxAttempts) {
        setTimeout(tryFind, 30);
      }
    };

    // Start trying
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tryFind();
      });
    });
  }

  private applyPageAnimation(element: HTMLElement) {
    if (!element) {
      return;
    }

    // Simple fade animation for better performance
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';

    // Force reflow
    void element.offsetWidth;

    // Apply transition
    element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';

    // Clean up after animation
    setTimeout(() => {
      if (element) {
        element.style.transition = '';
        element.style.transform = '';
        element.style.opacity = '';
      }
    }, 250);
  }
}
