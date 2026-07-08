export interface ErrorResponse {
  code: string;
  message: string;
  path: string;
  traceId?: string;
  timestamp: string;
}
