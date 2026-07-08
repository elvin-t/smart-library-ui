export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export const NOTIFICATION_STATUSES = [
  { value: NotificationStatus.PENDING, label: 'Pending' },
  { value: NotificationStatus.SENT, label: 'Sent' },
  { value: NotificationStatus.FAILED, label: 'Failed' }
];