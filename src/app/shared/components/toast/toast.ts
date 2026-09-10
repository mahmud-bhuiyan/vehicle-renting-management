import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  template: `
    <div
      class="pointer-events-none fixed bottom-4 right-4 z-60 flex max-w-[calc(100vw-2rem)] flex-col-reverse items-end gap-2 safe-area-bottom"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md"
          [class]="toastClasses(toast.type)"
          role="status"
        >
          <ng-icon [name]="toastIcon(toast.type)" class="mt-0.5 size-5 shrink-0" />
          <p class="min-w-0 flex-1 text-sm font-medium">{{ toast.message }}</p>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1 opacity-70 transition hover:opacity-100"
            [attr.aria-label]="'Dismiss notification'"
            (click)="toastService.dismiss(toast.id)"
          >
            <ng-icon name="heroXMark" class="size-4" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  protected toastClasses(type: 'success' | 'error'): string {
    return type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100'
      : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100';
  }

  protected toastIcon(type: 'success' | 'error'): string {
    return type === 'success' ? 'heroCheckCircle' : 'heroExclamationCircle';
  }
}
