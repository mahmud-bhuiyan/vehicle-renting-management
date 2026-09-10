import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dialogService.config(); as config) {
      <div
        class="fixed inset-0 z-70 flex items-end justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center safe-area-top safe-area-bottom"
        role="presentation"
        (click)="dialogService.cancel()"
      >
        <div
          class="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-surface-900"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="config.title"
          (click)="$event.stopPropagation()"
        >
          <div class="border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ config.title }}</h2>
            <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {{ config.message }}
            </p>
          </div>

          <div class="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              (click)="dialogService.cancel()"
            >
              {{ config.cancelLabel }}
            </button>
            <button
              type="button"
              class="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
              [class]="
                config.destructive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              "
              (click)="dialogService.confirm()"
            >
              {{ config.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly dialogService = inject(ConfirmDialogService);

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.dialogService.config()) {
      this.dialogService.cancel();
    }
  }
}
