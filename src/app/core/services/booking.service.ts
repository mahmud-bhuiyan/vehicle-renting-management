import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RentBookingFilter } from '../models/rent-booking-filter.model';
import { RentBookingView } from '../models/rent-booking.model';
import { CustomerService } from './customer.service';
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

function extractItem<T>(body: unknown): T | undefined {
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    return body as T;
  }

  return undefined;
}

function hasActiveFilter(filter: RentBookingFilter): boolean {
  return Object.values(filter).some((value) => value !== undefined && value !== null && value !== '');
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly dashboardService = inject(DashboardService);
  private readonly customerService = inject(CustomerService);
  private readonly baseUrl = environment.carRentalApi;

  private readonly bookingsCache = signal<RentBookingView[] | null>(null);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly isFiltered = signal(false);
  private readonly currentFilter = signal<RentBookingFilter | null>(null);

  readonly bookings = computed(() => this.bookingsCache() ?? []);
  readonly hasBookings = computed(() => this.bookingsCache() !== null);
  readonly isInitialLoading = computed(() => this.loading() && this.bookingsCache() === null);
  readonly isRefreshing = computed(() => this.loading() && this.bookingsCache() !== null);
  readonly loadError = computed(() => (this.bookingsCache() === null ? this.error() : null));
  readonly filtering = this.isFiltered.asReadonly();

  loadBookings(): void {
    const hadCache = this.bookingsCache() !== null;
    this.loading.set(true);
    this.isFiltered.set(false);
    this.currentFilter.set(null);

    if (!hadCache) {
      this.error.set(null);
    }

    this.fetchBookings()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (bookings) => {
          this.bookingsCache.set(bookings);
          this.error.set(null);
        },
        error: (err: Error) => {
          if (!hadCache) {
            this.error.set(err.message);
          }
        },
      });
  }

  applyFilter(filter: RentBookingFilter): void {
    if (!hasActiveFilter(filter)) {
      this.clearFilter();
      return;
    }

    const hadCache = this.bookingsCache() !== null;
    this.loading.set(true);
    this.isFiltered.set(true);
    this.currentFilter.set(filter);

    if (!hadCache) {
      this.error.set(null);
    }

    this.fetchFilteredBookings(filter)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (bookings) => {
          this.bookingsCache.set(bookings);
          this.error.set(null);
        },
        error: (err: Error) => {
          if (!hadCache) {
            this.error.set(err.message);
          }
        },
      });
  }

  clearFilter(): void {
    this.loadBookings();
  }

  reloadCurrentView(): void {
    const filter = this.currentFilter();
    if (this.isFiltered() && filter) {
      this.applyFilter(filter);
      return;
    }

    this.loadBookings();
  }

  getBookingById(bookingId: number): Observable<RentBookingView | undefined> {
    return this.http
      .get<unknown>(`${this.baseUrl}/GetBookingByBookingId?bookingId=${bookingId}`)
      .pipe(map((body) => extractItem<RentBookingView>(body)));
  }

  createBooking(booking: RentBookingView): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/CreateNewBooking`, booking)
      .pipe(tap(() => this.afterBookingMutation()));
  }

  deleteBooking(bookingId: number): Observable<unknown> {
    return this.http
      .delete(`${this.baseUrl}/DeletBookingById?id=${bookingId}`)
      .pipe(tap(() => this.afterBookingMutation()));
  }

  private afterBookingMutation(): void {
    this.reloadCurrentView();
    this.dashboardService.loadDashboardData();
    this.customerService.clearBookingsCache();
  }

  private fetchBookings(): Observable<RentBookingView[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/geAllBookings`)
      .pipe(map((body) => extractList<RentBookingView>(body)));
  }

  private fetchFilteredBookings(filter: RentBookingFilter): Observable<RentBookingView[]> {
    return this.http
      .post<unknown>(`${this.baseUrl}/FilterBookings`, filter)
      .pipe(map((body) => extractList<RentBookingView>(body)));
  }
}
