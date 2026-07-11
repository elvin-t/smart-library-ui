export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
}
