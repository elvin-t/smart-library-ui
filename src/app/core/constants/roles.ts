export const ROLES = {
  ADMIN: 'ADMIN',
  LIBRARIAN: 'LIBRARIAN',
  MEMBER: 'MEMBER'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];