export interface FineResponse {
  borrowRecordId: number;
  userId: number;
  bookId: number;

  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;

  overdueDays: number;
  finePerDay: number;
  fineAmount: number;

  finePaid: boolean;
  finePaidAt?: string | null;
}