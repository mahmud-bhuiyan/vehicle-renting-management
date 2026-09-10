import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, RouterLink],
  template: `
    <div
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-white/10 dark:bg-surface-900/50"
    >
      <div
        class="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
      >
        <ng-icon [name]="icon()" class="size-7" />
      </div>
      <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{{ title() }}</h3>
      <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {{ message() }}
      </p>
      @if (actionLabel() && actionRoute()) {
        <a
          [routerLink]="actionRoute()"
          class="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:from-indigo-700 hover:to-violet-700"
        >
          <ng-icon name="heroPlus" class="size-4" />
          {{ actionLabel() }}
        </a>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('heroInbox');
  readonly title = input('Nothing here yet');
  readonly message = input('Items will appear once data is available.');
  readonly actionLabel = input<string | null>(null);
  readonly actionRoute = input<string | null>(null);
}
