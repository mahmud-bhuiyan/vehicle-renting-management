import { Injectable, computed, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'vehicle-rental-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<AppTheme>('light');

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  initTheme(): void {
    const theme = this.readStoredTheme();
    this.themeSignal.set(theme);
    this.applyTheme(theme);
  }

  setTheme(theme: AppTheme): void {
    this.themeSignal.set(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  private readStoredTheme(): AppTheme {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
