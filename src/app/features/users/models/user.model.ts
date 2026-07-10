import { MembershipStatus } from './membership-status.model';
import { MembershipType } from './membership-type.model';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;

  membershipType: MembershipType;
  membershipStatus: MembershipStatus;

  /**
   * Optional because this belongs to Auth Service.
   * If backend returns active in user list/detail, UI can show correct login status.
   */
  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
}