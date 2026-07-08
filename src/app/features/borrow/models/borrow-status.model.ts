export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE'
}

export const BORROW_STATUSES = [
  { value: BorrowStatus.BORROWED, label: 'Borrowed' },
  { value: BorrowStatus.RETURNED, label: 'Returned' },
  { value: BorrowStatus.OVERDUE, label: 'Overdue' }
];