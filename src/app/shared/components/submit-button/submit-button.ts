import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="submit"
      [class]="classes()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
    >
      @if (loading()) {
        <span
          class="size-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
        ></span>
      }
      <span class="inline-flex items-center justify-center gap-2">
        <ng-content />
      </span>
    </button>
  `,
})
export class SubmitButtonComponent {
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly classes = input(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60',
  );
}
