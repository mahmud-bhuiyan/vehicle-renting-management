import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-background-refresh',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-surface-800/80 dark:text-slate-400"
        role="status"
        aria-live="polite"
      >
        <span
          class="size-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-white/20 dark:border-t-slate-300"
        ></span>
        Updating
      </span>
    }
  `,
})
export class BackgroundRefreshComponent {
  readonly visible = input(false);
}
