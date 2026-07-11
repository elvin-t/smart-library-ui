import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { TokenService } from '../services/token.service';
import { APP_ROUTES } from '../constants/app-routes';
import { ErrorResponse } from '../models/error-response.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = extractErrorMessage(error);

      if (error.status === 401) {
        tokenService.removeToken();

        toastr.error(
          errorMessage || 'Session expired. Please login again.',
          'Unauthorized'
        );

        router.navigate([APP_ROUTES.LOGIN]);
      } else if (error.status === 403) {
        toastr.error(
          errorMessage || 'You do not have permission to access this resource.',
          'Access Denied'
        );

        router.navigate(['/access-denied']);
      } else if (error.status === 409) {
        toastr.warning(
          errorMessage || 'Record already exists.',
          'Conflict'
        );
      } else if (error.status === 400) {
        toastr.warning(
          errorMessage || 'Invalid request. Please check your input.',
          'Validation Error'
        );
      } else if (error.status === 0) {
        toastr.error(
          'Unable to connect to server. Please check backend service.',
          'Server Unavailable'
        );
      } else {
        toastr.error(
          errorMessage || 'Something went wrong. Please try again.',
          'Error'
        );
      }

      return throwError(() => error);
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  const body = error.error;

  if (!body) {
    return error.message || 'Something went wrong.';
  }

  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as ErrorResponse;
      return parsed.message || body;
    } catch {
      return body;
    }
  }

  const errorResponse = body as ErrorResponse;

  if (errorResponse.message) {
    return errorResponse.message;
  }

  return error.message || 'Something went wrong.';
}
