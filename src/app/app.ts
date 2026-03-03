import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  effect,
  signal,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { AsyncPipe } from '@angular/common';
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
    AsyncPipe,
    FloatingMenuComponent,
    NavbarComponent,
    FooterComponent,
    ChatbotComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.sass',
})
export class App implements OnInit, OnDestroy {
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

  // Language for template access
  currentLanguage = computed(() => this.translationService.language());

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
  }

  ngOnInit() {
    // Set initial route
    this.currentRoute.set(this.router.url);

    // Listen to router events for loading indicator
    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isAnimating.set(true);
        this.loadingService.simulateProgress();
      } else if (event instanceof NavigationEnd) {
        this.loadingService.stopLoading();
        this.currentRoute.set(event.urlAfterRedirects);
        // Let View Transitions API handle the animation (configured via withViewTransitions())
        setTimeout(() => {
          this.isAnimating.set(false);
        }, 300);
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loadingService.stopLoading();
        this.isAnimating.set(false);
      }
    });
    this.subscriptions.add(routerSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
