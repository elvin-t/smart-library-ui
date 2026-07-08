export enum FineStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  PAID = 'PAID'
}

export const FINE_STATUSES = [
  { value: FineStatus.ALL, label: 'All' },
  { value: FineStatus.PENDING, label: 'Pending' },
  { value: FineStatus.PAID, label: 'Paid' }
];