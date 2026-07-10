export interface AdminCreateUserResponse {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  roles: string[];
  active: boolean;
  userProfileCreated: boolean;
}