export interface AdminUserStatusResponse {
  id: number;
  email: string;
  roles: string[];
  active: boolean;
  message: string;
}