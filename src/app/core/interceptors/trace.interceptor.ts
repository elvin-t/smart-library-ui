import { HttpInterceptorFn } from '@angular/common/http';

export const traceInterceptor: HttpInterceptorFn = (req, next) => {
  const traceId = crypto.randomUUID();

  const tracedRequest = req.clone({
    setHeaders: {
      'X-Trace-Id': traceId
    }
  });

  return next(tracedRequest);
};
