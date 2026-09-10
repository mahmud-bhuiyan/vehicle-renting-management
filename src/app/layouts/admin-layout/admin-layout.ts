import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, ThemeToggleComponent],
  templateUrl: './admin-layout.html',
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sidebarOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly pageTitle = signal('Dashboard');

  protected readonly navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'heroHome' },
    { label: 'Vehicles', route: '/vehicles', icon: 'heroTruck' },
    { label: 'Customer Ledger', route: '/customer-ledger', icon: 'heroUsers' },
    { label: 'Book Vehicle', route: '/book-vehicle', icon: 'heroClipboardDocumentList' },
    { label: 'Bookings', route: '/bookings', icon: 'heroCalendarDays' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.closeSidebar();
        this.closeUserMenu();
        this.pageTitle.set(this.resolvePageTitle(this.router.url));
      });

    this.pageTitle.set(this.resolvePageTitle(this.router.url));
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (window.innerWidth >= 1024) {
      this.closeSidebar();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeUserMenu();
    this.closeSidebar();
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  protected toggleSidebar(): void {
    this.closeUserMenu();
    this.setSidebarOpen(!this.sidebarOpen());
  }

  protected closeSidebar(): void {
    this.setSidebarOpen(false);
  }

  protected logout(): void {
    this.closeUserMenu();
    this.closeSidebar();
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private setSidebarOpen(open: boolean): void {
    this.sidebarOpen.set(open);
    document.body.classList.toggle('sidebar-open', open);
  }

  private resolvePageTitle(url: string): string {
    const match = this.navItems.find((item) => url === item.route || url.startsWith(`${item.route}/`));
    return match?.label ?? 'Dashboard';
  }
}
