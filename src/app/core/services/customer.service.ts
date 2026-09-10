import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RentBookingView } from '../models/rent-booking.model';
import { RentCustomer } from '../models/rent-customer.model';

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
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.carRentalApi;

  private readonly customersCache = signal<RentCustomer[] | null>(null);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  private readonly bookingsCache = signal<Record<number, RentBookingView[]>>({});
  private readonly bookingsLoading = signal<Record<number, boolean>>({});
  private readonly bookingsErrors = signal<Record<number, string>>({});

  readonly customers = computed(() => this.customersCache() ?? []);
  readonly hasCustomers = computed(() => this.customersCache() !== null);
  readonly isInitialLoading = computed(() => this.loading() && this.customersCache() === null);
  readonly isRefreshing = computed(() => this.loading() && this.customersCache() !== null);
  readonly loadError = computed(() => (this.customersCache() === null ? this.error() : null));

  readonly bookingsByCustomer = this.bookingsCache.asReadonly();
  readonly bookingsLoadingByCustomer = this.bookingsLoading.asReadonly();
  readonly bookingsErrorsByCustomer = this.bookingsErrors.asReadonly();

  loadCustomers(): void {
    const hadCache = this.customersCache() !== null;
    this.loading.set(true);

    if (!hadCache) {
      this.error.set(null);
    }

    this.fetchCustomers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (customers) => {
          this.customersCache.set(customers);
          this.error.set(null);
        },
        error: (err: Error) => {
          if (!hadCache) {
            this.error.set(err.message);
          }
        },
      });
  }

  getCustomerFromCache(customerId: number): RentCustomer | undefined {
    return this.customersCache()?.find((customer) => customer.customerId === customerId);
  }

  getCustomers(): Observable<RentCustomer[]> {
    return this.fetchCustomers();
  }

  getCustomerById(customerId: number): Observable<RentCustomer | undefined> {
    const cached = this.getCustomerFromCache(customerId);
    if (cached) {
      return this.fetchCustomers().pipe(
        map((customers) => customers.find((customer) => customer.customerId === customerId) ?? cached),
      );
    }

    return this.fetchCustomers().pipe(
      map((customers) => customers.find((customer) => customer.customerId === customerId)),
    );
  }

  loadBookingsByCustomerId(customerId: number): void {
    const hadCache = customerId in this.bookingsCache();

    this.bookingsLoading.update((state) => ({ ...state, [customerId]: true }));
    this.bookingsErrors.update((state) => {
      const next = { ...state };
      delete next[customerId];
      return next;
    });

    this.fetchBookingsByCustomerId(customerId)
      .pipe(
        finalize(() => {
          this.bookingsLoading.update((state) => ({ ...state, [customerId]: false }));
        }),
      )
      .subscribe({
        next: (bookings) => {
          this.bookingsCache.update((cache) => ({ ...cache, [customerId]: bookings }));
        },
        error: (err: Error) => {
          if (!hadCache) {
            this.bookingsErrors.update((state) => ({ ...state, [customerId]: err.message }));
          }
        },
      });
  }

  getBookingsByCustomerId(customerId: number): Observable<RentBookingView[]> {
    return this.fetchBookingsByCustomerId(customerId);
  }

  createCustomer(customer: RentCustomer): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/CreateNewCustomer`, customer).pipe(tap(() => this.loadCustomers()));
  }

  updateCustomer(customer: RentCustomer): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/UpdateCustomer`, customer).pipe(tap(() => this.loadCustomers()));
  }

  deleteCustomer(customerId: number): Observable<unknown> {
    return this.http
      .delete(`${this.baseUrl}/DeletCustomerById?id=${customerId}`)
      .pipe(
        tap(() => {
          this.loadCustomers();
          this.bookingsCache.update((cache) => {
            const next = { ...cache };
            delete next[customerId];
            return next;
          });
        }),
      );
  }

  invalidateCustomerBookings(customerId: number): void {
    this.bookingsCache.update((cache) => {
      const next = { ...cache };
      delete next[customerId];
      return next;
    });
  }

  private fetchCustomers(): Observable<RentCustomer[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/GetCustomers`)
      .pipe(map((body) => extractList<RentCustomer>(body)));
  }

  private fetchBookingsByCustomerId(customerId: number): Observable<RentBookingView[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/geAllBookingsByCustomerId?custId=${customerId}`)
      .pipe(map((body) => extractList<RentBookingView>(body)));
  }
}
