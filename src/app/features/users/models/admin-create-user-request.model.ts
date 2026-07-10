export interface AdminCreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  role: 'MEMBER' | 'LIBRARIAN';
}