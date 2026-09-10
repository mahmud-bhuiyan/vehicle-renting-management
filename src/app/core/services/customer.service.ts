import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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

  getCustomers(): Observable<RentCustomer[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/GetCustomers`)
      .pipe(map((body) => extractList<RentCustomer>(body)));
  }

  getCustomerById(customerId: number): Observable<RentCustomer | undefined> {
    return this.getCustomers().pipe(
      map((customers) => customers.find((customer) => customer.customerId === customerId)),
    );
  }

  getBookingsByCustomerId(customerId: number): Observable<RentBookingView[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/geAllBookingsByCustomerId?custId=${customerId}`)
      .pipe(map((body) => extractList<RentBookingView>(body)));
  }

  createCustomer(customer: RentCustomer): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/CreateNewCustomer`, customer);
  }

  updateCustomer(customer: RentCustomer): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/UpdateCustomer`, customer);
  }

  deleteCustomer(customerId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/DeletCustomerById?id=${customerId}`);
  }
}
