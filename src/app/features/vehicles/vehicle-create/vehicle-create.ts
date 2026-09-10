import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CarService } from '../../../core/services/car.service';
import { ToastService } from '../../../core/services/toast.service';
import { VehicleFormComponent, VehicleFormValue } from '../vehicle-form/vehicle-form';

@Component({
  selector: 'app-vehicle-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, VehicleFormComponent],
  templateUrl: './vehicle-create.html',
})
export class VehicleCreateComponent {
  private readonly carService = inject(CarService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);

  protected onSubmit(payload: VehicleFormValue): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.carService
      .createCar(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Vehicle created successfully');
          void this.router.navigate(['/vehicles']);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  protected onCancel(): void {
    void this.router.navigate(['/vehicles']);
  }
}
