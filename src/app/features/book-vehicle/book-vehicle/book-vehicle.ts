import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RentBookingView } from '../../../core/models/rent-booking.model';
import { BookingService } from '../../../core/services/booking.service';
import { CarService } from '../../../core/services/car.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { BackgroundRefreshComponent } from '../../../shared/components/background-refresh/background-refresh';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { BookVehicleFormComponent } from '../book-vehicle-form/book-vehicle-form';

@Component({
  selector: 'app-book-vehicle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, EmptyStateComponent, BookVehicleFormComponent, BackgroundRefreshComponent],
  templateUrl: './book-vehicle.html',
})
export class BookVehicleComponent implements OnInit {
  protected readonly carService = inject(CarService);
  protected readonly customerService = inject(CustomerService);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly formComponent = viewChild(BookVehicleFormComponent);

  protected readonly isSubmitting = signal(false);

  protected readonly isInitialLoading = computed(() => {
    const waitingCars = !this.carService.hasCars() && this.carService.isInitialLoading();
    const waitingCustomers =
      !this.customerService.hasCustomers() && this.customerService.isInitialLoading();

    return waitingCars || waitingCustomers;
  });

  protected readonly isRefreshing = computed(
    () => this.carService.isRefreshing() || this.customerService.isRefreshing(),
  );

  protected readonly loadError = computed(
    () => this.carService.loadError() ?? this.customerService.loadError(),
  );

  protected readonly canShowForm = computed(
    () => this.carService.hasCars() && this.carService.cars().length > 0,
  );

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.carService.loadCars();
    this.customerService.loadCustomers();
  }

  protected onSubmit(booking: RentBookingView): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.bookingService
      .createBooking(booking)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Booking created successfully');
          this.isSubmitting.set(false);
          this.formComponent()?.resetForm();
          void this.router.navigate(['/bookings']);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  protected onCancel(): void {
    void this.router.navigate(['/dashboard']);
  }
}
