import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const traceInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);

  if (!isApiRequest) {
    return next(req);
  }

  const traceId = crypto.randomUUID();

  const tracedRequest = req.clone({
    setHeaders: {
      'X-Trace-Id': traceId
    }
  });

  return next(tracedRequest);
};
