import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardData } from '../models/dashboard-data.model';

function extractDashboardData(body: unknown): DashboardData | null {
  if (Array.isArray(body) && body.length > 0) {
    return body[0] as DashboardData;
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const data = record['data'] ?? record['Data'];

    if (Array.isArray(data) && data.length > 0) {
      return data[0] as DashboardData;
    }

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as DashboardData;
    }

    return record as unknown as DashboardData;
  }

  return null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.carRentalApi;

  private readonly dataCache = signal<DashboardData | null>(null);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  readonly data = computed(() => this.dataCache());
  readonly hasData = computed(() => this.dataCache() !== null);
  readonly isInitialLoading = computed(() => this.loading() && this.dataCache() === null);
  readonly isRefreshing = computed(() => this.loading() && this.dataCache() !== null);
  readonly loadError = computed(() => (this.dataCache() === null ? this.error() : null));

  loadDashboardData(): void {
    const hadCache = this.dataCache() !== null;
    this.loading.set(true);

    if (!hadCache) {
      this.error.set(null);
    }

    this.fetchDashboardData()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          if (data) {
            this.dataCache.set(data);
            this.error.set(null);
          } else if (!hadCache) {
            this.error.set('Dashboard data is unavailable');
          }
        },
        error: (err: Error) => {
          if (!hadCache) {
            this.error.set(err.message);
          }
        },
      });
  }

  private fetchDashboardData(): Observable<DashboardData | null> {
    return this.http
      .get<unknown>(`${this.baseUrl}/GetDashboardData`)
      .pipe(map((body) => extractDashboardData(body)));
  }
}
