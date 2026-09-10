import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RentBookingFilter } from '../models/rent-booking-filter.model';
import { RentBookingView } from '../models/rent-booking.model';

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

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.carRentalApi;

  getBookings(): Observable<RentBookingView[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/geAllBookings`)
      .pipe(map((body) => extractList<RentBookingView>(body)));
  }

  filterBookings(filter: RentBookingFilter): Observable<RentBookingView[]> {
    return this.http
      .post<unknown>(`${this.baseUrl}/FilterBookings`, filter)
      .pipe(map((body) => extractList<RentBookingView>(body)));
  }

  getBookingById(bookingId: number): Observable<RentBookingView | undefined> {
    return this.http
      .get<unknown>(`${this.baseUrl}/GetBookingByBookingId?bookingId=${bookingId}`)
      .pipe(map((body) => extractItem<RentBookingView>(body)));
  }

  createBooking(booking: RentBookingView): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/CreateNewBooking`, booking);
  }

  deleteBooking(bookingId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/DeletBookingById?id=${bookingId}`);
  }
}
