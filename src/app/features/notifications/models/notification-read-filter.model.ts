export enum NotificationReadFilter {
  ALL = 'ALL',
  UNREAD = 'UNREAD',
  READ = 'READ'
}

export const NOTIFICATION_READ_FILTERS = [
  { value: NotificationReadFilter.ALL, label: 'All' },
  { value: NotificationReadFilter.UNREAD, label: 'Unread' },
  { value: NotificationReadFilter.READ, label: 'Read' }
];
