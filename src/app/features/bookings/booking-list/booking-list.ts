import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RentBookingFilter } from '../../../core/models/rent-booking-filter.model';
import { RentBookingView } from '../../../core/models/rent-booking.model';
import { BookingService } from '../../../core/services/booking.service';
import { CarService } from '../../../core/services/car.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { BackgroundRefreshComponent } from '../../../shared/components/background-refresh/background-refresh';
import { DataTableComponent } from '../../../shared/components/data-table/data-table';
import { DataTableColumn } from '../../../shared/components/data-table/data-table.model';
import { TableCellTemplateDirective } from '../../../shared/components/data-table/table-cell-template.directive';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-booking-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIcon,
    EmptyStateComponent,
    DataTableComponent,
    TableCellTemplateDirective,
    CurrencyPipe,
    DatePipe,
    BackgroundRefreshComponent,
  ],
  templateUrl: './booking-list.html',
})
export class BookingListComponent implements OnInit {
  protected readonly bookingService = inject(BookingService);
  protected readonly carService = inject(CarService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly deletingBookingId = signal<number | null>(null);
  protected readonly detailBookingId = signal<number | null>(null);
  protected readonly detailBooking = signal<RentBookingView | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal<string | null>(null);

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    customerName: [''],
    mobileNo: [''],
    carId: [''],
    fromDate: [''],
    toDate: [''],
  });

  protected readonly tableColumns: DataTableColumn<RentBookingView>[] = [
    { key: 'bookingId', header: 'ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'car', header: 'Vehicle' },
    { key: 'bookingDate', header: 'Date' },
    { key: 'totalBillAmount', header: 'Amount' },
    { key: 'actions', header: 'Actions', align: 'right' },
  ];

  constructor() {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const filter = this.buildFilterPayload();

        if (!this.hasFilterValues(filter)) {
          if (this.bookingService.filtering()) {
            this.bookingService.loadBookings();
          }
          return;
        }

        this.bookingService.applyFilter(filter);
      });
  }

  ngOnInit(): void {
    this.bookingService.loadBookings();
    this.carService.loadCars();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.detailBookingId()) {
      this.closeDetail();
    }
  }

  protected reloadBookings(): void {
    this.bookingService.reloadCurrentView();
  }

  protected clearFilters(): void {
    this.filterForm.reset({
      customerName: '',
      mobileNo: '',
      carId: '',
      fromDate: '',
      toDate: '',
    });
    this.bookingService.clearFilter();
  }

  protected carLabel(carId: number): string {
    const car = this.carService.getCarFromCache(carId);
    return car ? `${car.brand} ${car.model}` : `Car #${carId}`;
  }

  protected openDetail(booking: RentBookingView): void {
    if (!booking.bookingId) {
      return;
    }

    this.detailBookingId.set(booking.bookingId);
    this.detailBooking.set(null);
    this.detailError.set(null);
    this.detailLoading.set(true);

    this.bookingService
      .getBookingById(booking.bookingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detailBooking.set(detail ?? booking);
          this.detailLoading.set(false);
        },
        error: (err: Error) => {
          this.detailError.set(err.message);
          this.detailLoading.set(false);
        },
      });
  }

  protected closeDetail(): void {
    this.detailBookingId.set(null);
    this.detailBooking.set(null);
    this.detailError.set(null);
    this.detailLoading.set(false);
  }

  protected async deleteBooking(booking: RentBookingView): Promise<void> {
    if (!booking.bookingId || this.deletingBookingId() !== null) {
      return;
    }

    const confirmed = await this.confirmDialog.open({
      title: 'Delete booking',
      message: `Remove booking #${booking.bookingId} for ${booking.customerName}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    if (this.detailBookingId() === booking.bookingId) {
      this.closeDetail();
    }

    this.deletingBookingId.set(booking.bookingId);

    this.bookingService
      .deleteBooking(booking.bookingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Booking deleted successfully');
          this.deletingBookingId.set(null);
        },
        error: () => {
          this.deletingBookingId.set(null);
        },
      });
  }

  protected isDeleting(booking: RentBookingView): boolean {
    return booking.bookingId != null && this.deletingBookingId() === booking.bookingId;
  }

  protected hasActiveFilters(): boolean {
    const value = this.filterForm.getRawValue();
    return Boolean(
      value.customerName.trim() ||
        value.mobileNo.trim() ||
        value.carId ||
        value.fromDate ||
        value.toDate,
    );
  }

  private buildFilterPayload(): RentBookingFilter {
    const value = this.filterForm.getRawValue();

    return {
      CustomerName: value.customerName.trim() || undefined,
      MobileNo: value.mobileNo.trim() || undefined,
      CarId: value.carId ? Number(value.carId) : undefined,
      FromBookingDate: value.fromDate ? new Date(value.fromDate).toISOString() : undefined,
      ToBookingDate: value.toDate ? new Date(value.toDate).toISOString() : undefined,
    };
  }

  private hasFilterValues(filter: RentBookingFilter): boolean {
    return Object.values(filter).some((value) => value !== undefined && value !== null && value !== '');
  }
}
