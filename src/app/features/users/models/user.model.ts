import { MembershipStatus } from './membership-status.model';
import { MembershipType } from './membership-type.model';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;

  membershipType: MembershipType;
  membershipStatus: MembershipStatus;

  createdAt?: string;
  updatedAt?: string;
}