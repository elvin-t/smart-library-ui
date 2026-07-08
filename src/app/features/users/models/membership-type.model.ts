export enum MembershipType {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  STUDENT = 'STUDENT'
}

export const MEMBERSHIP_TYPES = [
  { value: MembershipType.STANDARD, label: 'Standard' },
  { value: MembershipType.PREMIUM, label: 'Premium' },
  { value: MembershipType.STUDENT, label: 'Student' }
];