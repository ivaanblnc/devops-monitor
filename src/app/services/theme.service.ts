import { Injectable, signal, effect } from '@angular/core';

/**
 * ThemeService
 * Manages light/dark mode toggle and persistence
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'devops-monitor-theme';
  private readonly STORAGE_KEY = 'devops-monitor-theme-preference';

  // Signal for current theme
  currentTheme = signal<'light' | 'dark'>('dark');

  constructor() {
    this.loadTheme();
    this.setupThemeEffect();
  }

  /**
   * Setup effect to apply theme changes
   */
  private setupThemeEffect(): void {
    effect(() => {
      this.applyTheme(this.currentTheme());
      this.saveTheme();
    });
  }

  /**
   * Load theme from localStorage
   */
  private loadTheme(): void {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as 'light' | 'dark' | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        this.currentTheme.set(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme.set(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      this.currentTheme.set('dark');
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.currentTheme());
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Apply theme by updating document class
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const body = document.body;

    if (theme === 'light') {
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
    }
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
  }

  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' {
    return this.currentTheme();
  }

  /**
   * Check if light mode is active
   */
  isLightMode(): boolean {
    return this.currentTheme() === 'light';
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }
}
