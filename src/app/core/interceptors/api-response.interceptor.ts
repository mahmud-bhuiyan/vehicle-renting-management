import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

interface NormalizedApiResponse {
  result: boolean;
  data: unknown;
  message?: string;
}

function normalizeApiResponse(body: unknown): NormalizedApiResponse | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const result = record['Result'] ?? record['result'];

  if (typeof result !== 'boolean') {
    return null;
  }

  const data = record['Data'] ?? record['data'];
  const message = record['Message'] ?? record['message'];

  return {
    result,
    data,
    message: typeof message === 'string' ? message : undefined,
  };
}

function readErrorMessage(error: HttpErrorResponse): string {
  const body = error.error;

  if (body && typeof body === 'object') {
    const normalized = normalizeApiResponse(body);
    if (normalized?.message) {
      return normalized.message;
    }

    const record = body as Record<string, unknown>;
    const message = record['Message'] ?? record['message'];
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return error.message || 'Network request failed';
}

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) {
        return event;
      }

      const normalized = normalizeApiResponse(event.body);

      if (!normalized) {
        return event;
      }

      if (!normalized.result) {
        throw new Error(normalized.message ?? 'API request failed');
      }

      return event.clone({ body: normalized.data });
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = readErrorMessage(error);
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
