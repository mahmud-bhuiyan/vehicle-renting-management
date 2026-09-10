import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { startWith } from 'rxjs';
import { RentCar } from '../../../core/models/rent-car.model';

export type VehicleFormValue = Omit<RentCar, 'carId'>;

@Component({
  selector: 'app-vehicle-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgIcon, CurrencyPipe],
  templateUrl: './vehicle-form.html',
})
export class VehicleFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly submitLabel = input('Save vehicle');
  readonly isSubmitting = input(false);
  readonly initialValue = input<VehicleFormValue | null>(null);

  readonly submitted = output<VehicleFormValue>();
  readonly cancelled = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    year: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(1900), Validators.max(2100)],
    ],
    color: [''],
    dailyRate: [0, [Validators.required, Validators.min(0)]],
    carImage: [''],
    regNo: ['', Validators.required],
  });

  protected readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly previewTitle = computed(() => {
    const { brand, model } = this.formValue();
    const title = `${brand ?? ''} ${model ?? ''}`.trim();
    return title || 'Your next rental';
  });

  protected readonly previewSubtitle = computed(() => {
    const { year, color, regNo } = this.formValue();
    const parts = [year ? String(year) : null, color, regNo].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Fill in the details to preview';
  });

  protected readonly previewImage = computed(() => this.formValue().carImage?.trim() || null);

  constructor() {
    effect(() => {
      this.resetForm(this.initialValue());
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected fieldError(field: string): string | null {
    const control = this.form.get(field);

    if (!control?.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('min')) {
      return 'Value is too low';
    }

    if (control.hasError('max')) {
      return 'Value is too high';
    }

    return 'Invalid value';
  }

  resetForm(value: VehicleFormValue | null): void {
    this.form.reset({
      brand: value?.brand ?? '',
      model: value?.model ?? '',
      year: value?.year ?? new Date().getFullYear(),
      color: value?.color ?? '',
      dailyRate: value?.dailyRate ?? 0,
      carImage: value?.carImage ?? '',
      regNo: value?.regNo ?? '',
    });
  }
}
