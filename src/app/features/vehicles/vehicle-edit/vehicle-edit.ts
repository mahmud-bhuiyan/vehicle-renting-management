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
import { CarService } from '../../../core/services/car.service';
import { ToastService } from '../../../core/services/toast.service';
import { BackgroundRefreshComponent } from '../../../shared/components/background-refresh/background-refresh';
import { VehicleFormComponent, VehicleFormValue } from '../vehicle-form/vehicle-form';

@Component({
  selector: 'app-vehicle-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, VehicleFormComponent, BackgroundRefreshComponent],
  templateUrl: './vehicle-edit.html',
})
export class VehicleEditComponent implements OnInit {
  protected readonly carService = inject(CarService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly carId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly isSubmitting = signal(false);

  protected readonly vehicle = computed(() => {
    if (!this.carId || Number.isNaN(this.carId)) {
      return null;
    }

    return this.carService.cars().find((car) => car.carId === this.carId) ?? null;
  });

  protected readonly isInitialLoading = computed(() => {
    if (!this.carId || Number.isNaN(this.carId)) {
      return false;
    }

    return !this.carService.hasCars() && this.carService.isInitialLoading();
  });

  protected readonly errorMessage = computed(() => {
    if (!this.carId || Number.isNaN(this.carId)) {
      return 'Invalid vehicle ID';
    }

    if (this.carService.hasCars() && !this.vehicle()) {
      return 'Vehicle not found';
    }

    return this.carService.loadError();
  });

  ngOnInit(): void {
    if (!this.carId || Number.isNaN(this.carId)) {
      return;
    }

    this.carService.loadCars();
  }

  protected onSubmit(payload: VehicleFormValue): void {
    const car = this.vehicle();
    if (!car?.carId) {
      return;
    }

    if (this.isSubmitting()) {
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
