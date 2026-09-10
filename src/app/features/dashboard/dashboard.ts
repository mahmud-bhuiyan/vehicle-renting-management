import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  protected readonly stats = [
    {
      label: 'Total Vehicles',
      value: '—',
      trend: 'Phase 4 — Vehicles',
      trendColor: 'text-indigo-600',
      icon: 'heroTruck',
      iconBg: 'from-indigo-500 to-violet-500',
      accent: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Active Customers',
      value: '—',
      trend: 'Phase 5 — Ledger',
      trendColor: 'text-violet-600',
      icon: 'heroUsers',
      iconBg: 'from-violet-500 to-fuchsia-500',
      accent: 'from-violet-500 to-fuchsia-500',
    },
    {
      label: 'Bookings',
      value: '—',
      trend: 'Phase 7 — Listings',
      trendColor: 'text-cyan-600',
      icon: 'heroCalendarDays',
      iconBg: 'from-cyan-500 to-blue-500',
      accent: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Revenue',
      value: '—',
      trend: 'Phase 8 — Dashboard API',
      trendColor: 'text-emerald-600',
      icon: 'heroBanknotes',
      iconBg: 'from-emerald-500 to-teal-500',
      accent: 'from-emerald-500 to-teal-500',
    },
  ];

  protected readonly phases = [
    { name: 'Foundation', progress: 100, bar: 'from-indigo-500 to-violet-500' },
    { name: 'Auth & Routing', progress: 100, bar: 'from-violet-500 to-fuchsia-500' },
    { name: 'Shared UI', progress: 100, bar: 'from-cyan-500 to-blue-500' },
    { name: 'Feature Modules', progress: 0, bar: 'from-emerald-500 to-teal-500' },
  ];

  protected readonly quickActions = [
    {
      label: 'Add vehicle',
      hint: 'Coming in Phase 4',
      icon: 'heroPlus',
      iconBg: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'New booking',
      hint: 'Coming in Phase 6',
      icon: 'heroClipboardDocumentList',
      iconBg: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'View ledger',
      hint: 'Coming in Phase 5',
      icon: 'heroChartBar',
      iconBg: 'from-emerald-500 to-teal-500',
    },
  ];
}
