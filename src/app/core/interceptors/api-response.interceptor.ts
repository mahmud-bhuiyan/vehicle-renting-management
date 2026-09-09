import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
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

        return throwError(() => new Error(message));
      }

      return throwError(() => error);
    }),
  );
};
