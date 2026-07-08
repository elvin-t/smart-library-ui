import { BorrowStatus } from './borrow-status.model';

export interface BorrowRecord {
  id: number;
  userId: number;
  bookId: number;

  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;

  status: BorrowStatus;
  overdue: boolean;

  overdueDays?: number;
  fineAmount?: number;
  finePaid?: boolean;
  finePaidAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}