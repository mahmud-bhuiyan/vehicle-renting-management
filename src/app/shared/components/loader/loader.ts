import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.isLoading()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <div
          class="size-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
        ></div>
      </div>
    }
  `,
})
export class LoaderComponent {
  protected readonly loadingService = inject(LoadingService);
}
