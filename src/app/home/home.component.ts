import {
  Component,
  inject,
  computed,
  signal,
  OnInit,
  OnDestroy,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../core/translation.service';
import { AuthService } from '../auth/auth.service';
import { PerformanceService } from '../core/performance.service';
import { ScrollLoadDirective } from '../shared/scroll-load.directive';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { AssetUrlPipe } from '../shared/pipes/asset-url.pipe';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ScrollLoadDirective, SkeletonComponent, AssetUrlPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private performanceService = inject(PerformanceService);

  constructor() {
    // Move modal to body when it opens
    effect(() => {
      const isOpen = this.isModalOpen();
      if (isOpen) {
        setTimeout(() => {
          const modalElement = document.querySelector('.modal-overlay') as HTMLElement;
          if (modalElement && modalElement.parentElement !== document.body) {
            document.body.appendChild(modalElement);
          }
        }, 0);
      }
    });
  }

  isArabic = computed(() => this.translationService.isArabic());
  currentSlide = signal(0);
  private carouselInterval: any;

  // Loading states for sections
  heroLoading = signal(true);
  howItWorksLoading = signal(true);
  featuredLoading = signal(true);
  journeyLoading = signal(true);

  // Visibility states for scroll-triggered loading
  howItWorksVisible = signal(false);
  featuredVisible = signal(false);
  journeyVisible = signal(false);
  statsVisible = signal(false);
  contactVisible = signal(false);

  // Hero Images - يتم جلبها من قاعدة البيانات
  heroImages = signal<string[]>([]);
  howItWorksImages = signal<string[]>([]);
  featuredAuctions = signal<any[]>([]);

  // Statistics
  stats = signal<{ totalUsers: number; totalProducts: number; endedAuctions: number } | null>(null);
  statsLoading = signal(false);
  private statsInterval: any;

  // Translations
  heroTitle = computed(() => this.translationService.t('home.hero.title'));
  heroSubtitle = computed(() => this.translationService.t('home.hero.subtitle'));
  howItWorksTitle = computed(() => this.translationService.t('home.howItWorks.title'));
  step1Title = computed(() => this.translationService.t('home.howItWorks.step1.title'));
  step1Description = computed(() => this.translationService.t('home.howItWorks.step1.description'));
  step2Title = computed(() => this.translationService.t('home.howItWorks.step2.title'));
  step2Description = computed(() => this.translationService.t('home.howItWorks.step2.description'));
  featuredAuctionsTitle = computed(() => this.translationService.t('home.featuredAuctions.title'));
  statsTitle = computed(() => this.translationService.t('home.stats.title'));
  statsTotalUsers = computed(() => this.translationService.t('home.stats.totalUsers'));
  statsTotalProducts = computed(() => this.translationService.t('home.stats.totalProducts'));
  statsEndedAuctions = computed(() => this.translationService.t('home.stats.endedAuctions'));
  projectJourneyTitle = computed(() => this.translationService.t('home.projectJourney.title'));
  projectJourneySubtitle = computed(() =>
    this.translationService.t('home.projectJourney.subtitle'),
  );
  contactTitle = computed(() => this.translationService.t('home.contact.title'));
  contactSubtitle = computed(() => this.translationService.t('home.contact.subtitle'));
  contactButton = computed(() => this.translationService.t('home.contact.button'));

  // Project Journey Points
  projectJourneyPoints = signal([
    {
      id: 1,
      title: computed(() => this.translationService.t('home.projectJourney.point1.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point1.content')),
    },
    {
      id: 2,
      title: computed(() => this.translationService.t('home.projectJourney.point2.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point2.content')),
    },
    {
      id: 3,
      title: computed(() => this.translationService.t('home.projectJourney.point3.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point3.content')),
    },
    {
      id: 4,
      title: computed(() => this.translationService.t('home.projectJourney.point4.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point4.content')),
    },
    {
      id: 5,
      title: computed(() => this.translationService.t('home.projectJourney.point5.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point5.content')),
    },
    {
      id: 6,
      title: computed(() => this.translationService.t('home.projectJourney.point6.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point6.content')),
    },
    {
      id: 7,
      title: computed(() => this.translationService.t('home.projectJourney.point7.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point7.content')),
    },
    {
      id: 8,
      title: computed(() => this.translationService.t('home.projectJourney.point8.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point8.content')),
    },
    {
      id: 9,
      title: computed(() => this.translationService.t('home.projectJourney.point9.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point9.content')),
    },
    {
      id: 10,
      title: computed(() => this.translationService.t('home.projectJourney.point10.title')),
      content: computed(() => this.translationService.t('home.projectJourney.point10.content')),
    },
  ]);

  // Journey Map State
  selectedPointId = signal<number | null>(null);
  isModalOpen = signal(false);

  // Computed signal for selected point data
  selectedPoint = computed(() => {
    const id = this.selectedPointId();
    if (!id) return null;
    const point = this.projectJourneyPoints().find((p) => p.id === id);
    return point || null;
  });

  ngOnInit() {
    // Load images immediately for faster LCP
    this.loadImages();

    // Delay carousel auto-rotation to after initial render
    setTimeout(() => {
      this.carouselInterval = setInterval(() => {
        if (this.heroImages().length > 0) {
          this.nextSlide();
        }
      }, 5000);
    }, 1000);
  }

  // Scroll-triggered section loaders
  onHowItWorksVisible() {
    if (!this.howItWorksVisible()) {
      this.howItWorksVisible.set(true);
      // Content already loaded, just show it
      this.howItWorksLoading.set(false);
    }
  }

  onFeaturedVisible() {
    if (!this.featuredVisible()) {
      this.featuredVisible.set(true);
      this.loadFeaturedAuctions();
    }
  }

  onJourneyVisible() {
    if (!this.journeyVisible()) {
      this.journeyVisible.set(true);
      this.journeyLoading.set(false);
    }
  }

  onStatsVisible() {
    if (!this.statsVisible()) {
      this.statsVisible.set(true);
      this.loadStats();
      // Update stats every 30 seconds only when visible
      this.statsInterval = setInterval(() => {
        this.loadStats();
      }, 30000);
    }
  }

  onContactVisible() {
    if (!this.contactVisible()) {
      this.contactVisible.set(true);
    }
  }

  loadImages() {
    // Load Hero images with timeout for faster fallback
    const timeout = setTimeout(() => {
      // Fallback if request takes too long
      if (this.heroLoading()) {
        this.heroImages.set([
          'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+1',
          'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+2',
          'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+3',
        ]);
        this.heroLoading.set(false);
      }
    }, 2000);

    this.http
      .get<{ success: boolean; images: any[] }>(`${environment.apiUrl}/home/images/hero`)
      .subscribe({
        next: (response) => {
          clearTimeout(timeout);
          if (response.success && response.images.length > 0) {
            this.heroImages.set(response.images.map((img) => `${environment.apiUrl}${img.url}`));
          } else {
            // Fallback to placeholder images if no images found
            this.heroImages.set([
              'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+1',
              'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+2',
              'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+3',
            ]);
          }
          this.heroLoading.set(false);
        },
        error: () => {
          clearTimeout(timeout);
          // Fallback to placeholder images if backend is not available
          this.heroImages.set([
            'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+1',
            'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+2',
            'https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=Mazzady+3',
          ]);
          this.heroLoading.set(false);
        },
      });

    // Load How It Works images
    this.http
      .get<{ success: boolean; images: any[] }>(`${environment.apiUrl}/home/images/howItWorks`)
      .subscribe({
        next: (response) => {
          if (response.success && response.images.length > 0) {
            this.howItWorksImages.set(
              response.images.map((img) => `${environment.apiUrl}${img.url}`),
            );
          }
        },
        error: () => {
          // Silently handle error
        },
      });
  }

  loadFeaturedAuctions() {
    this.featuredLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/auctions/featured`).subscribe({
      next: (auctions) => {
        this.featuredAuctions.set(auctions);
        this.featuredLoading.set(false);
      },
      error: () => {
        this.featuredLoading.set(false);
      },
    });
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  loadStats() {
    this.statsLoading.set(true);
    this.http
      .get<{
        totalUsers: number;
        totalProducts: number;
        endedAuctions: number;
      }>(`${environment.apiUrl}/admin/public-stats`)
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.statsLoading.set(false);
          // Animate counters after a short delay
          this.performanceService.scheduleIdleTask(() => {
            this.animateCounters();
          }, 100);
        },
        error: () => {
          this.statsLoading.set(false);
        },
      });
  }

  private counterAnimations: Map<Element, number> = new Map();

  animateCounters() {
    const stats = this.stats();
    if (!stats) return;

    const counters = document.querySelectorAll('.stat-value[data-count]');
    counters.forEach((counter) => {
      // Cancel previous animation if exists
      const previousAnimation = this.counterAnimations.get(counter);
      if (previousAnimation) {
        cancelAnimationFrame(previousAnimation);
      }

      const target = parseInt(counter.getAttribute('data-count') || '0', 10);
      if (target === 0) {
        counter.textContent = this.formatNumber(0);
        return;
      }

      const duration = 2000; // 2 seconds
      const startTime = performance.now();
      const startValue = 0;

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startValue + (target - startValue) * easedProgress);

        counter.textContent = this.formatNumber(current);

        if (progress < 1) {
          const animationId = requestAnimationFrame(updateCounter);
          this.counterAnimations.set(counter, animationId);
        } else {
          counter.textContent = this.formatNumber(target);
          this.counterAnimations.delete(counter);
        }
      };

      const animationId = requestAnimationFrame(updateCounter);
      this.counterAnimations.set(counter, animationId);
    });
  }

  nextSlide() {
    this.currentSlide.update((current) => (current + 1) % this.heroImages().length);
  }

  prevSlide() {
    this.currentSlide.update(
      (current) => (current - 1 + this.heroImages().length) % this.heroImages().length,
    );
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
  }

  onContactClick() {
    this.router.navigate(['/join-us']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  openJourneyModal(pointId: number) {
    if (this.isModalOpen()) return;
    this.selectedPointId.set(pointId);
    this.isModalOpen.set(true);
  }

  closeJourneyModal() {
    if (!this.isModalOpen()) return;
    this.isModalOpen.set(false);
    setTimeout(() => {
      this.selectedPointId.set(null);
    }, 200);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US').format(num);
  }
}
