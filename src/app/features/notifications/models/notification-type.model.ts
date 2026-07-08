export enum NotificationType {
  BORROW_CONFIRMATION = 'BORROW_CONFIRMATION',
  RETURN_CONFIRMATION = 'RETURN_CONFIRMATION',
  DUE_DATE_REMINDER = 'DUE_DATE_REMINDER',
  OVERDUE_REMINDER = 'OVERDUE_REMINDER'
}

export const NOTIFICATION_TYPES = [
  { value: NotificationType.BORROW_CONFIRMATION, label: 'Borrow Confirmation' },
  { value: NotificationType.RETURN_CONFIRMATION, label: 'Return Confirmation' },
  { value: NotificationType.DUE_DATE_REMINDER, label: 'Due Date Reminder' },
  { value: NotificationType.OVERDUE_REMINDER, label: 'Overdue Reminder' }
];