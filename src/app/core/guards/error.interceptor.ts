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
      const errorBody = error.error as ErrorResponse;

      if (error.status === 401) {
        tokenService.removeToken();
        toastr.error('Session expired. Please login again.');
        router.navigate([APP_ROUTES.LOGIN]);
      } else if (error.status === 403) {
        toastr.error('You do not have permission to access this resource.');
        router.navigate(['/access-denied']);
      } else if (error.status === 0) {
        toastr.error('Unable to connect to server.');
      } else {
        const message = errorBody?.message || 'Something went wrong. Please try again.';
        toastr.error(message);
      }

      return throwError(() => error);
    })
  );
};
