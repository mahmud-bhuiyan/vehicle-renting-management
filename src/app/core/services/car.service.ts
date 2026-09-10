import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RentCar } from '../models/rent-car.model';
import { DashboardService } from './dashboard.service';

function extractList<T>(body: unknown): T[] {
  if (Array.isArray(body)) {
    return body;
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const data = record['data'] ?? record['Data'];

    if (Array.isArray(data)) {
      return data;
    }
  }

  return [];
}

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly http = inject(HttpClient);
  private readonly dashboardService = inject(DashboardService);
  private readonly baseUrl = environment.carRentalApi;

  private readonly carsCache = signal<RentCar[] | null>(null);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  readonly cars = computed(() => this.carsCache() ?? []);
  readonly hasCars = computed(() => this.carsCache() !== null);
  readonly isInitialLoading = computed(() => this.loading() && this.carsCache() === null);
  readonly isRefreshing = computed(() => this.loading() && this.carsCache() !== null);
  readonly loadError = computed(() => (this.carsCache() === null ? this.error() : null));

  loadCars(): void {
    const hadCache = this.carsCache() !== null;
    this.loading.set(true);

    if (!hadCache) {
      this.error.set(null);
    }

    this.fetchCars()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (cars) => {
          this.carsCache.set(cars);
          this.error.set(null);
        },
        error: (err: Error) => {
          if (!hadCache) {
            this.error.set(err.message);
          }
        },
      });
  }

  getCarFromCache(carId: number): RentCar | undefined {
    return this.carsCache()?.find((car) => car.carId === carId);
  }

  createCar(car: RentCar): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/CreateNewCar`, car).pipe(tap(() => this.afterFleetMutation()));
  }

  updateCar(car: RentCar): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/UpdateCar`, car).pipe(tap(() => this.afterFleetMutation()));
  }

  deleteCar(carId: number): Observable<unknown> {
    return this.http
      .delete(`${this.baseUrl}/DeleteCarbyCarId?carid=${carId}`)
      .pipe(tap(() => this.afterFleetMutation()));
  }

  private afterFleetMutation(): void {
    this.loadCars();
    this.dashboardService.loadDashboardData();
  }

  private fetchCars(): Observable<RentCar[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/GetCars`)
      .pipe(map((body) => extractList<RentCar>(body)));
  }
}
