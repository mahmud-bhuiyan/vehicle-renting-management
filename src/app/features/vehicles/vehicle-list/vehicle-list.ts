import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RentCar } from '../../../core/models/rent-car.model';
import { CarService } from '../../../core/services/car.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { DataTableComponent } from '../../../shared/components/data-table/data-table';
import { DataTableColumn } from '../../../shared/components/data-table/data-table.model';
import { TableCellTemplateDirective } from '../../../shared/components/data-table/table-cell-template.directive';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-vehicle-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgIcon,
    EmptyStateComponent,
    DataTableComponent,
    TableCellTemplateDirective,
    CurrencyPipe,
  ],
  templateUrl: './vehicle-list.html',
})
export class VehicleListComponent implements OnInit {
  private readonly carService = inject(CarService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cars = signal<RentCar[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly tableColumns: DataTableColumn<RentCar>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      value: (car) => `${car.brand} ${car.model}`,
    },
    { key: 'regNo', header: 'Reg No' },
    { key: 'year', header: 'Year' },
    {
      key: 'color',
      header: 'Color',
      value: (car) => car.color ?? '',
    },
    { key: 'dailyRate', header: 'Daily rate' },
    { key: 'actions', header: 'Actions', align: 'right' },
  ];

  ngOnInit(): void {
    this.loadCars();
  }

  protected loadCars(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.carService
      .getCars()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cars) => {
          this.cars.set(cars);
          this.isLoading.set(false);
        },
        error: (error: Error) => {
          this.cars.set([]);
          this.errorMessage.set(error.message);
          this.isLoading.set(false);
        },
      });
  }

  protected async deleteCar(car: RentCar): Promise<void> {
    if (!car.carId) {
      return;
    }

    const confirmed = await this.confirmDialog.open({
      title: 'Delete vehicle',
      message: `Remove ${car.brand} ${car.model} (${car.regNo})? This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    this.carService
      .deleteCar(car.carId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Vehicle deleted successfully');
          this.loadCars();
        },
      });
  }
}
