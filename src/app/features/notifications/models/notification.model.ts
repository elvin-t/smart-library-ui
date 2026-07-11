import { NotificationType } from './notification-type.model';
import { NotificationStatus } from './notification-status.model';
import { NotificationChannel } from './notification-channel.model';

export interface Notification {
  id: number;
  userId: number;
  email?: string | null;

  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;

  subject: string;
  message: string;

  bookId?: number | null;
  borrowRecordId?: number | null;

  read?: boolean;
  readAt?: string | null;

  createdAt: string;
  sentAt?: string | null;
}
