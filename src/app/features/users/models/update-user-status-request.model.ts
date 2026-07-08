import { MembershipStatus } from './membership-status.model';

export interface UpdateUserStatusRequest {
  membershipStatus: MembershipStatus;
}