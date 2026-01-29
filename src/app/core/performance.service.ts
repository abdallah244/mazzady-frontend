import { Injectable, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private idleCallbackIds: number[] = [];
  private rafIds: number[] = [];
  private observers: IntersectionObserver[] = [];
  private mutationObservers: MutationObserver[] = [];

  // Default cache TTL: 5 minutes
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPerformanceOptimizations();
    }
  }

  /**
   * Initialize all performance optimizations
   */
  private initPerformanceOptimizations(): void {
    this.enableResourceHints();
    this.optimizeScrollPerformance();
    this.setupMemoryManagement();
    this.enablePassiveEventListeners();
  }

  /**
   * Add resource hints for faster loading
   */
  private enableResourceHints(): void {
    // Preconnect to common origins
    const preconnectOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
    ];

    preconnectOrigins.forEach((origin) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Optimize scroll performance
   */
  private optimizeScrollPerformance(): void {
    // Use passive event listeners for scroll
    document.addEventListener('scroll', () => {}, { passive: true });
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
    document.addEventListener('wheel', () => {}, { passive: true });
  }

  /**
   * Setup memory management
   */
  private setupMemoryManagement(): void {
    // Clean up cache periodically
    this.scheduleIdleTask(() => {
      this.cleanExpiredCache();
    }, 60000); // Every minute

    // Monitor memory usage
    if ('memory' in performance) {
      this.scheduleIdleTask(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          this.clearCache();
          console.warn('[Performance] High memory usage detected, cache cleared');
        }
      }, 30000);
    }
  }

  /**
   * Enable passive event listeners globally
   */
  private enablePassiveEventListeners(): void {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];

    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      let modifiedOptions = options;

      if (passiveEvents.includes(type)) {
        if (typeof options === 'boolean') {
          modifiedOptions = { capture: options, passive: true };
        } else if (typeof options === 'object') {
          modifiedOptions = { ...options, passive: options.passive !== false };
        } else {
          modifiedOptions = { passive: true };
        }
      }

      return originalAddEventListener.call(this, type, listener, modifiedOptions);
    };
  }

  /**
   * Schedule a task during browser idle time
   */
  public scheduleIdleTask(callback: () => void, timeout: number = 1000): void {
    if (!isPlatformBrowser(this.platformId)) {
      callback();
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if ('requestIdleCallback' in window) {
        const id = (window as any).requestIdleCallback(
          () => {
            this.ngZone.run(callback);
          },
          { timeout },
        );
        this.idleCallbackIds.push(id);
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => {
          this.ngZone.run(callback);
        }, 1);
      }
    });
  }

  /**
   * Schedule animation frame task
   */
  public scheduleAnimationFrame(callback: () => void): number {
    if (!isPlatformBrowser(this.platformId)) {
      callback();
      return 0;
    }

    const id = requestAnimationFrame(() => {
      this.ngZone.run(callback);
    });
    this.rafIds.push(id);
    return id;
  }

  /**
   * Debounce function calls
   */
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: any;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Cache data with TTL
   */
  public setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cached data
   */
  public getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Deduplicate concurrent requests
   */
  public async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.getCache<T>(key);
    if (cached) return cached;

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) return pending;

    // Make new request
    const request = requestFn()
      .then((result) => {
        this.setCache(key, result);
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Lazy load images using Intersection Observer
   */
  public setupLazyImages(container?: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = container || document;
    const images = root.querySelectorAll<HTMLImageElement>('img[data-src]');

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset['src'];
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      },
    );

    images.forEach((img) => imageObserver.observe(img));
    this.observers.push(imageObserver);
  }

  /**
   * Preload critical resources
   */
  public preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }

    document.head.appendChild(link);
  }

  /**
   * Prefetch resources for future navigation
   */
  public prefetchResource(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): Partial<PerformanceMetrics> {
    if (!isPlatformBrowser(this.platformId)) return {};

    const metrics: Partial<PerformanceMetrics> = {};

    // Get Paint Timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Get LCP if available
    if ('PerformanceObserver' in window) {
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          metrics.largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
        }
      } catch (e) {
        // LCP not supported
      }
    }

    return metrics;
  }

  /**
   * Optimize images by adding loading="lazy" and decoding="async"
   */
  public optimizeImages(container?: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = container || document;
    const images = root.querySelectorAll<HTMLImageElement>('img:not([loading])');

    images.forEach((img) => {
      // Skip images that are already in viewport
      const rect = img.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (!isInViewport) {
        img.loading = 'lazy';
      }
      img.decoding = 'async';
    });
  }

  /**
   * Detect slow network and adjust loading strategy
   */
  public isSlowNetwork(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const connection = (navigator as any).connection;
    if (!connection) return false;

    const slowTypes = ['slow-2g', '2g', '3g'];
    return slowTypes.includes(connection.effectiveType) || connection.saveData;
  }

  /**
   * Run code outside Angular zone for better performance
   */
  public runOutsideAngular<T>(fn: () => T): T {
    return this.ngZone.runOutsideAngular(fn);
  }

  /**
   * Run code inside Angular zone when needed
   */
  public runInsideAngular<T>(fn: () => T): T {
    return this.ngZone.run(fn);
  }

  /**
   * Cleanup all observers and pending tasks
   */
  public cleanup(): void {
    // Cancel idle callbacks
    this.idleCallbackIds.forEach((id) => {
      if ('cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(id);
      }
    });
    this.idleCallbackIds = [];

    // Cancel animation frames
    this.rafIds.forEach((id) => cancelAnimationFrame(id));
    this.rafIds = [];

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    // Disconnect mutation observers
    this.mutationObservers.forEach((observer) => observer.disconnect());
    this.mutationObservers = [];

    // Clear cache
    this.clearCache();
    this.pendingRequests.clear();
  }

  /**
   * Measure function execution time
   */
  public measureExecutionTime<T>(fn: () => T, label: string): T {
    if (!isPlatformBrowser(this.platformId)) return fn();

    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.debug(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  }

  /**
   * Create a performance mark
   */
  public mark(name: string): void {
    if (isPlatformBrowser(this.platformId)) {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   */
  public measure(name: string, startMark: string, endMark: string): number {
    if (!isPlatformBrowser(this.platformId)) return 0;

    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      return entries.length > 0 ? entries[0].duration : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Virtual scroll helper - calculate visible items
   */
  public calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number,
    overscan: number = 3,
  ): { startIndex: number; endIndex: number; offsetY: number } {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, offsetY };
  }
}
