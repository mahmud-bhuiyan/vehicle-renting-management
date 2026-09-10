import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  template: `
    <button
      type="button"
      class="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
      [attr.aria-label]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      (click)="themeService.toggleTheme()"
    >
      @if (themeService.isDark()) {
        <ng-icon name="heroSun" class="size-5" />
      } @else {
        <ng-icon name="heroMoon" class="size-5" />
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
}
