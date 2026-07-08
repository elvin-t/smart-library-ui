export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED'
}

export const MEMBERSHIP_STATUSES = [
  { value: MembershipStatus.ACTIVE, label: 'Active' },
  { value: MembershipStatus.SUSPENDED, label: 'Suspended' },
  { value: MembershipStatus.EXPIRED, label: 'Expired' }
];