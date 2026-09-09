import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-gray-900">Dashboard</h2>
      <p class="mt-2 text-gray-600">
        Phase 1 layout shell is ready. Dashboard API integration comes in Phase 8.
      </p>
    </section>
  `,
})
export class DashboardComponent {}
