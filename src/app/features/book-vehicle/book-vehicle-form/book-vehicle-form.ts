import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { startWith } from 'rxjs';
import { RentCar } from '../../../core/models/rent-car.model';
import { RentCustomer } from '../../../core/models/rent-customer.model';
import { RentBookingView } from '../../../core/models/rent-booking.model';
import { SubmitButtonComponent } from '../../../shared/components/submit-button/submit-button';

export type BookVehicleFormValue = RentBookingView & { rentalDays: number };

function mobileDigitsValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string | null)?.trim();

  if (!value) {
    return null;
  }

  return /^\d{10}$/.test(value) ? null : { mobileDigits: true };
}

function toLocalDateTimeValue(date = new Date()): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

@Component({
  selector: 'app-book-vehicle-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgIcon, CurrencyPipe, DatePipe, SubmitButtonComponent],
  templateUrl: './book-vehicle-form.html',
})
export class BookVehicleFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly cars = input<RentCar[]>([]);
  readonly customers = input<RentCustomer[]>([]);
  readonly submitLabel = input('Create booking');
  readonly isSubmitting = input(false);

  readonly submitted = output<RentBookingView>();
  readonly cancelled = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    customerSelect: [''],
    customerName: ['', Validators.required],
    customerCity: [''],
    mobileNo: ['', mobileDigitsValidator],
    email: ['', [Validators.required, Validators.email]],
    carId: [0, [Validators.required, Validators.min(1)]],
    bookingDate: [toLocalDateTimeValue(), Validators.required],
    rentalDays: [1, [Validators.required, Validators.min(1)]],
    discount: [0, [Validators.min(0)]],
  });

  protected readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly selectedCar = computed(() => {
    const carId = this.formValue().carId;
    return this.cars().find((car) => car.carId === carId) ?? null;
  });

  protected readonly subtotal = computed(() => {
    const car = this.selectedCar();
    const rentalDays = this.formValue().rentalDays ?? 1;

    if (!car) {
      return 0;
    }

    return car.dailyRate * rentalDays;
  });

  protected readonly totalBillAmount = computed(() => {
    const discount = this.formValue().discount ?? 0;
    return Math.max(0, this.subtotal() - discount);
  });

  protected readonly previewCustomer = computed(() => {
    const { customerName, customerCity, email, mobileNo } = this.formValue();
    return {
      name: customerName?.trim() || 'Customer details',
      subtitle: [customerCity, mobileNo, email].filter(Boolean).join(' · ') || 'Select or enter customer info',
    };
  });

  protected onCustomerSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (!value) {
      return;
    }

    const customer = this.customers().find((item) => String(item.customerId) === value);

    if (!customer) {
      return;
    }

    this.form.patchValue({
      customerName: customer.customerName,
      customerCity: customer.customerCity ?? '',
      mobileNo: customer.mobileNo ?? '',
      email: customer.email ?? '',
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const bookingDate = new Date(raw.bookingDate);

    if (Number.isNaN(bookingDate.getTime())) {
      this.form.get('bookingDate')?.setErrors({ invalidDate: true });
      this.form.get('bookingDate')?.markAsTouched();
      return;
    }

    const payload: RentBookingView = {
      customerName: raw.customerName.trim(),
      customerCity: raw.customerCity.trim() || undefined,
      mobileNo: raw.mobileNo.trim() || undefined,
      email: raw.email.trim(),
      carId: Number(raw.carId),
      bookingDate: bookingDate.toISOString(),
      discount: raw.discount > 0 ? Math.floor(raw.discount) : undefined,
      totalBillAmount: this.totalBillAmount(),
    };

    this.submitted.emit(payload);
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  resetForm(): void {
    this.form.reset({
      customerSelect: '',
      customerName: '',
      customerCity: '',
      mobileNo: '',
      email: '',
      carId: 0,
      bookingDate: toLocalDateTimeValue(),
      rentalDays: 1,
      discount: 0,
    });
  }

  protected fieldError(field: string): string | null {
    const control = this.form.get(field);

    if (!control?.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address';
    }

    if (control.hasError('min')) {
      return 'Value is too low';
    }

    if (control.hasError('mobileDigits')) {
      return 'Mobile number must be exactly 10 digits';
    }

    if (control.hasError('invalidDate')) {
      return 'Enter a valid booking date';
    }

    return 'Invalid value';
  }

  protected carLabel(car: RentCar): string {
    return `${car.brand} ${car.model} (${car.regNo}) — ${car.dailyRate}/day`;
  }
}
