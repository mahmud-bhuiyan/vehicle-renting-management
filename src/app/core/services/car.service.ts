import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RentCar } from '../models/rent-car.model';

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
  private readonly baseUrl = environment.carRentalApi;

  getCars(): Observable<RentCar[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/GetCars`)
      .pipe(map((body) => extractList<RentCar>(body)));
  }

  getCarById(carId: number): Observable<RentCar | undefined> {
    return this.getCars().pipe(map((cars) => cars.find((car) => car.carId === carId)));
  }

  createCar(car: RentCar): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/CreateNewCar`, car);
  }

  updateCar(car: RentCar): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/UpdateCar`, car);
  }

  deleteCar(carId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/DeleteCarbyCarId?carid=${carId}`);
  }
}
