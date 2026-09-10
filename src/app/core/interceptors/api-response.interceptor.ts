import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ToastService } from '../services/toast.service';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) {
        return event;
      }

      const body = event.body as ApiResponse<unknown> | null;

      if (!body || typeof body !== 'object' || !('Result' in body)) {
        return event;
      }

      if (!body.Result) {
        throw new Error(body.Message ?? 'API request failed');
      }

      return event.clone({ body: body.Data });
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message =
          (error.error as ApiResponse | null)?.Message ??
          error.message ??
          'Network request failed';

        toastService.error(message);
        return throwError(() => new Error(message));
      }

      if (error instanceof Error) {
        toastService.error(error.message);
      }

      return throwError(() => error);
    }),
  );
};
