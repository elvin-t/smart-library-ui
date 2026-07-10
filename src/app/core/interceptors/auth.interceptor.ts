import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  /**
   * Supports both:
   *
   * Local Angular dev:
   * http://localhost:8080/api/books
   *
   * Docker/Nginx mode:
   * /api/books
   */
  const isApiRequest = environment.apiBaseUrl
    ? req.url.startsWith(environment.apiBaseUrl)
    : req.url.startsWith('/api');

  if (token && isApiRequest) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authRequest);
  }

  return next(req);
};
