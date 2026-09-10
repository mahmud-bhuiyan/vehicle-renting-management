import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RentBookingView } from '../../../core/models/rent-booking.model';
import {
  CustomerLedgerSummary,
  RentCustomer,
} from '../../../core/models/rent-customer.model';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { BackgroundRefreshComponent } from '../../../shared/components/background-refresh/background-refresh';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

function aggregateBookings(bookings: RentBookingView[]): CustomerLedgerSummary {
  if (bookings.length === 0) {
    return { totalBookings: 0, totalSpent: 0, lastBookingDate: null };
  }

  const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalBillAmount ?? 0), 0);
  const lastBookingDate = bookings.reduce<string | null>((latest, booking) => {
    if (!booking.bookingDate) {
      return latest;
    }

    if (!latest || new Date(booking.bookingDate) > new Date(latest)) {
      return booking.bookingDate;
    }

    return latest;
  }, null);

  return {
    totalBookings: bookings.length,
    totalSpent,
    lastBookingDate,
  };
}

@Component({
  selector: 'app-customer-ledger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgIcon,
    FormsModule,
    EmptyStateComponent,
    CurrencyPipe,
    DatePipe,
    BackgroundRefreshComponent,
  ],
  templateUrl: './customer-ledger.html',
})
export class CustomerLedgerComponent implements OnInit {
  protected readonly customerService = inject(CustomerService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly searchQuery = signal('');
  protected readonly expandedCustomerId = signal<number | null>(null);
  protected readonly deletingCustomerId = signal<number | null>(null);

  protected readonly filteredCustomers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.customerService.customers();

    if (!query) {
      return list;
    }

    return list.filter((customer) => {
      const haystack = [
        customer.customerName,
        customer.customerCity,
        customer.mobileNo,
        customer.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  });

  ngOnInit(): void {
    this.customerService.loadCustomers();
  }

  protected reloadCustomers(): void {
    this.customerService.loadCustomers();
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected summaryFor(customerId?: number): CustomerLedgerSummary | null {
    if (!customerId) {
      return null;
    }

    const bookings = this.customerService.bookingsByCustomer()[customerId];
    if (!bookings) {
      return null;
    }

    return aggregateBookings(bookings);
  }

  protected bookingsFor(customerId?: number): RentBookingView[] {
    if (!customerId) {
      return [];
    }

    return this.customerService.bookingsByCustomer()[customerId] ?? [];
  }

  protected isExpanded(customer: RentCustomer): boolean {
    return customer.customerId === this.expandedCustomerId();
  }

  protected isLoadingBookings(customerId?: number): boolean {
    if (!customerId) {
      return false;
    }

    const hasCache = customerId in this.customerService.bookingsByCustomer();
    const isLoading = this.customerService.bookingsLoadingByCustomer()[customerId];

    return !!isLoading && !hasCache;
  }

  protected isRefreshingBookings(customerId?: number): boolean {
    if (!customerId) {
      return false;
    }

    const hasCache = customerId in this.customerService.bookingsByCustomer();
    const isLoading = this.customerService.bookingsLoadingByCustomer()[customerId];

    return !!isLoading && hasCache;
  }

  protected bookingErrorFor(customerId?: number): string | null {
    if (!customerId) {
      return null;
    }

    return this.customerService.bookingsErrorsByCustomer()[customerId] ?? null;
  }

  protected hasBookingsCache(customerId?: number): boolean {
    return customerId != null && customerId in this.customerService.bookingsByCustomer();
  }

  protected reloadBookings(customerId: number): void {
    this.customerService.loadBookingsByCustomerId(customerId);
  }

  protected toggleExpand(customer: RentCustomer): void {
    const customerId = customer.customerId;
    if (!customerId) {
      return;
    }

    if (this.expandedCustomerId() === customerId) {
      this.expandedCustomerId.set(null);
      return;
    }

    this.expandedCustomerId.set(customerId);
    this.customerService.loadBookingsByCustomerId(customerId);
  }

  protected async deleteCustomer(customer: RentCustomer): Promise<void> {
    if (!customer.customerId || this.deletingCustomerId() !== null) {
      return;
    }

    const confirmed = await this.confirmDialog.open({
      title: 'Delete customer',
      message: `Remove ${customer.customerName}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    this.deletingCustomerId.set(customer.customerId);

    this.customerService
      .deleteCustomer(customer.customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Customer deleted successfully');

          if (this.expandedCustomerId() === customer.customerId) {
            this.expandedCustomerId.set(null);
          }

          this.deletingCustomerId.set(null);
        },
        error: () => {
          this.deletingCustomerId.set(null);
        },
      });
  }

  protected isDeleting(customer: RentCustomer): boolean {
    return customer.customerId != null && this.deletingCustomerId() === customer.customerId;
  }
}
