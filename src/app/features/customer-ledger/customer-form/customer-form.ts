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
import { NgIcon } from '@ng-icons/core';
import { startWith } from 'rxjs';
import { RentCustomer } from '../../../core/models/rent-customer.model';
import { SubmitButtonComponent } from '../../../shared/components/submit-button/submit-button';

export type CustomerFormValue = Omit<RentCustomer, 'customerId'>;

@Component({
  selector: 'app-customer-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgIcon, SubmitButtonComponent],
  templateUrl: './customer-form.html',
})
export class CustomerFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly submitLabel = input('Save customer');
  readonly isSubmitting = input(false);
  readonly initialValue = input<CustomerFormValue | null>(null);

  readonly submitted = output<CustomerFormValue>();
  readonly cancelled = output<void>();

  protected readonly form = this.formBuilder.nonNullable.group({
    customerName: ['', Validators.required],
    customerCity: [''],
    mobileNo: ['', Validators.minLength(10)],
    email: ['', Validators.email],
  });

  protected readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly previewTitle = computed(() => {
    const name = this.formValue().customerName?.trim();
    return name || 'New customer';
  });

  protected readonly previewSubtitle = computed(() => {
    const { customerCity, mobileNo, email } = this.formValue();
    const parts = [customerCity, mobileNo, email].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Fill in contact details';
  });

  constructor() {
    effect(() => {
      this.resetForm(this.initialValue());
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

    if (control.hasError('email')) {
      return 'Enter a valid email address';
    }

    if (control.hasError('minlength')) {
      return 'Mobile number must be at least 10 characters';
    }

    return 'Invalid value';
  }

  resetForm(value: CustomerFormValue | null): void {
    this.form.reset({
      customerName: value?.customerName ?? '',
      customerCity: value?.customerCity ?? '',
      mobileNo: value?.mobileNo ?? '',
      email: value?.email ?? '',
    });
  }
}
