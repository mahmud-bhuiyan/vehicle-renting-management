import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './admin-layout.html',
})
export class AdminLayoutComponent {
  protected readonly navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'heroHome' },
    { label: 'Vehicles', route: '/vehicles', icon: 'heroTruck' },
    { label: 'Customer Ledger', route: '/customer-ledger', icon: 'heroUsers' },
    { label: 'Book Vehicle', route: '/book-vehicle', icon: 'heroClipboardDocumentList' },
    { label: 'Bookings', route: '/bookings', icon: 'heroCalendarDays' },
  ];
}
