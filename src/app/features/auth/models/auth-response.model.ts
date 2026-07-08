export interface AuthResponse {
  token: string;
  tokenType?: string;
  userId?: number;
  email?: string;
  roles: string[];
  permissions: string[];
}
