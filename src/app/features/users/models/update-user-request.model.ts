import { MembershipType } from './membership-type.model';

export interface UpdateUserRequest {
  fullName: string;
  phone?: string | null;
  membershipType: MembershipType;
}