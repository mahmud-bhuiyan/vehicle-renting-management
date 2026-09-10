import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { forkJoin } from 'rxjs';
import { RentBookingView } from '../../../core/models/rent-booking.model';
import { RentCar } from '../../../core/models/rent-car.model';
import { RentCustomer } from '../../../core/models/rent-customer.model';
import { BookingService } from '../../../core/services/booking.service';
import { CarService } from '../../../core/services/car.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { BookVehicleFormComponent } from '../book-vehicle-form/book-vehicle-form';

@Component({
  selector: 'app-book-vehicle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, EmptyStateComponent, BookVehicleFormComponent],
  templateUrl: './book-vehicle.html',
})
export class BookVehicleComponent implements OnInit {
  private readonly carService = inject(CarService);
  private readonly customerService = inject(CustomerService);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly formComponent = viewChild(BookVehicleFormComponent);

  protected readonly cars = signal<RentCar[]>([]);
  protected readonly customers = signal<RentCustomer[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    forkJoin({
      cars: this.carService.getCars(),
      customers: this.customerService.getCustomers(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ cars, customers }) => {
          this.cars.set(cars);
          this.customers.set(customers);
          this.isLoading.set(false);
        },
        error: (error: Error) => {
          this.cars.set([]);
          this.customers.set([]);
          this.errorMessage.set(error.message);
          this.isLoading.set(false);
        },
      });
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
