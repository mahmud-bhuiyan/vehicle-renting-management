import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RentCustomer } from '../../../core/models/rent-customer.model';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerFormComponent, CustomerFormValue } from '../customer-form/customer-form';

@Component({
  selector: 'app-customer-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, CustomerFormComponent],
  templateUrl: './customer-edit.html',
})
export class CustomerEditComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly customer = signal<RentCustomer | null>(null);

  ngOnInit(): void {
    const customerId = Number(this.route.snapshot.paramMap.get('id'));

    if (!customerId || Number.isNaN(customerId)) {
      this.errorMessage.set('Invalid customer ID');
      this.isLoading.set(false);
      return;
    }

    this.customerService
      .getCustomerById(customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (found) => {
          if (!found) {
            this.errorMessage.set('Customer not found');
          } else {
            this.customer.set(found);
          }
          this.isLoading.set(false);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
          this.isLoading.set(false);
        },
      });
  }

  protected onSubmit(payload: CustomerFormValue): void {
    const customer = this.customer();
    if (!customer?.customerId) {
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.customerService
      .updateCustomer({ ...payload, customerId: customer.customerId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Customer updated successfully');
          void this.router.navigate(['/customer-ledger']);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  protected onCancel(): void {
    void this.router.navigate(['/customer-ledger']);
  }
}
