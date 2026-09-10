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
import { RentCar } from '../../../core/models/rent-car.model';
import { CarService } from '../../../core/services/car.service';
import { ToastService } from '../../../core/services/toast.service';
import { VehicleFormComponent, VehicleFormValue } from '../vehicle-form/vehicle-form';

@Component({
  selector: 'app-vehicle-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, VehicleFormComponent],
  templateUrl: './vehicle-edit.html',
})
export class VehicleEditComponent implements OnInit {
  private readonly carService = inject(CarService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly vehicle = signal<RentCar | null>(null);

  ngOnInit(): void {
    const carId = Number(this.route.snapshot.paramMap.get('id'));

    if (!carId || Number.isNaN(carId)) {
      this.errorMessage.set('Invalid vehicle ID');
      this.isLoading.set(false);
      return;
    }

    this.carService
      .getCarById(carId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (car) => {
          if (!car) {
            this.errorMessage.set('Vehicle not found');
          } else {
            this.vehicle.set(car);
          }
          this.isLoading.set(false);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
          this.isLoading.set(false);
        },
      });
  }

  protected onSubmit(payload: VehicleFormValue): void {
    const car = this.vehicle();
    if (!car?.carId) {
      return;
    }

    this.isSubmitting.set(true);

    this.carService
      .updateCar({ ...payload, carId: car.carId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Vehicle updated successfully');
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
