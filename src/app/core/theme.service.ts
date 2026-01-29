import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'dark' | 'light';
export type ColorScheme = 'default' | 'basic';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'mazzady_theme';
  private readonly THEME_PERSISTENT_KEY = 'mazzady_theme_persistent';
  private readonly SCHEME_KEY = 'mazzady_color_scheme';
  private readonly SCHEME_PERSISTENT_KEY = 'mazzady_scheme_persistent';

  private currentTheme = signal<Theme>('dark');
  private currentScheme = signal<ColorScheme>('default');
  private isPersistent = signal<boolean>(false);
  private isSchemePersistent = signal<boolean>(false);

  // Get current theme
  theme = computed(() => this.currentTheme());

  // Get current scheme
  scheme = computed(() => this.currentScheme());

  // Check if dark theme
  isDark = computed(() => this.currentTheme() === 'dark');

  // Check if light theme
  isLight = computed(() => this.currentTheme() === 'light');

  // Get persistence state
  persistent = computed(() => this.isPersistent());

  // Get scheme persistence state
  schemePersistent = computed(() => this.isSchemePersistent());

  constructor() {
    // Load theme and scheme from localStorage
    this.loadTheme();
    this.loadScheme();

    // Apply theme when it changes
    effect(() => {
      this.applyTheme(this.currentTheme());
      this.applyScheme(this.currentScheme());
    });
  }

  // Load theme from localStorage
  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const savedPersistent = localStorage.getItem(this.THEME_PERSISTENT_KEY);

    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      this.currentTheme.set(savedTheme);
    } else {
      // Default to dark theme
      this.currentTheme.set('dark');
    }

    if (savedPersistent === 'true') {
      this.isPersistent.set(true);
    } else {
      this.isPersistent.set(false);
    }
  }

  // Load scheme from localStorage
  private loadScheme(): void {
    const savedScheme = localStorage.getItem(this.SCHEME_KEY) as ColorScheme;
    const savedSchemePersistent = localStorage.getItem(this.SCHEME_PERSISTENT_KEY);

    const validSchemes: ColorScheme[] = ['default', 'basic'];

    if (savedScheme && validSchemes.includes(savedScheme)) {
      this.currentScheme.set(savedScheme);
    } else {
      // Default to default scheme
      this.currentScheme.set('default');
    }

    if (savedSchemePersistent === 'true') {
      this.isSchemePersistent.set(true);
    } else {
      this.isSchemePersistent.set(false);
    }
  }

  // Toggle theme
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  // Set theme
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);

    // Save to localStorage if persistent
    if (this.isPersistent()) {
      localStorage.setItem(this.THEME_KEY, theme);
    } else {
      localStorage.removeItem(this.THEME_KEY);
    }
  }

  // Set color scheme
  setScheme(scheme: ColorScheme): void {
    this.currentScheme.set(scheme);

    // Always save to localStorage
    localStorage.setItem(this.SCHEME_KEY, scheme);
  }

  // Set persistence
  setPersistent(persistent: boolean): void {
    this.isPersistent.set(persistent);
    localStorage.setItem(this.THEME_PERSISTENT_KEY, String(persistent));

    // If enabling persistence, save current theme
    if (persistent) {
      localStorage.setItem(this.THEME_KEY, this.currentTheme());
    } else {
      localStorage.removeItem(this.THEME_KEY);
    }
  }

  // Set scheme persistence
  setSchemePersistent(persistent: boolean): void {
    this.isSchemePersistent.set(persistent);
    localStorage.setItem(this.SCHEME_PERSISTENT_KEY, String(persistent));

    // If enabling persistence, save current scheme
    if (persistent) {
      localStorage.setItem(this.SCHEME_KEY, this.currentScheme());
    } else {
      localStorage.removeItem(this.SCHEME_KEY);
    }
  }

  // Apply theme to document
  private applyTheme(theme: Theme): void {
    const html = document.documentElement;

    if (theme === 'light') {
      html.classList.remove('dark-theme');
      html.classList.add('light-theme');
    } else {
      html.classList.remove('light-theme');
      html.classList.add('dark-theme');
    }
  }

  // Apply color scheme to document
  private applyScheme(scheme: ColorScheme): void {
    const html = document.documentElement;

    // Remove all scheme classes
    html.classList.remove('scheme-default', 'scheme-basic');

    // Add current scheme class
    html.classList.add(`scheme-${scheme}`);
  }
}
