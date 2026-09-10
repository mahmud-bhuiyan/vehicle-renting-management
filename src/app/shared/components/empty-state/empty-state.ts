import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
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
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('heroInbox');
  readonly title = input('Nothing here yet');
  readonly message = input('Items will appear once data is available.');
}
