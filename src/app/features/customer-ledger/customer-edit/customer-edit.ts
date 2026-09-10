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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { BackgroundRefreshComponent } from '../../../shared/components/background-refresh/background-refresh';
import { CustomerFormComponent, CustomerFormValue } from '../customer-form/customer-form';

@Component({
  selector: 'app-customer-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, CustomerFormComponent, BackgroundRefreshComponent],
  templateUrl: './customer-edit.html',
})
export class CustomerEditComponent implements OnInit {
  protected readonly customerService = inject(CustomerService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly customerId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly isSubmitting = signal(false);

  protected readonly customer = computed(() => {
    if (!this.customerId || Number.isNaN(this.customerId)) {
      return null;
    }

    return (
      this.customerService.customers().find((item) => item.customerId === this.customerId) ?? null
    );
  });

  protected readonly isInitialLoading = computed(() => {
    if (!this.customerId || Number.isNaN(this.customerId)) {
      return false;
    }

    return !this.customerService.hasCustomers() && this.customerService.isInitialLoading();
  });

  protected readonly errorMessage = computed(() => {
    if (!this.customerId || Number.isNaN(this.customerId)) {
      return 'Invalid customer ID';
    }

    if (this.customerService.hasCustomers() && !this.customer()) {
      return 'Customer not found';
    }

    return this.customerService.loadError();
  });

  ngOnInit(): void {
    if (!this.customerId || Number.isNaN(this.customerId)) {
      return;
    }

    this.customerService.loadCustomers();
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
