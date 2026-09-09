import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.isLoading()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md safe-area-top safe-area-bottom"
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <div class="relative flex flex-col items-center gap-4">
          <div class="relative size-14 sm:size-16">
            <div class="absolute inset-0 rounded-full border-2 border-indigo-400/30"></div>
            <div
              class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-violet-400"
            ></div>
            <div
              class="absolute inset-2 animate-spin-slow rounded-full border-2 border-transparent border-b-indigo-400 border-l-violet-300"
            ></div>
          </div>
          <p class="text-sm font-medium tracking-wide text-white/90">Loading...</p>
        </div>
      </div>
    }
  `,
})
export class LoaderComponent {
  protected readonly loadingService = inject(LoadingService);
}
