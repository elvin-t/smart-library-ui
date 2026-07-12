import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { NotificationApiService } from '../../services/notification-api.service';
import { Notification } from '../../models/notification.model';

import {
  NOTIFICATION_TYPES,
  NotificationType
} from '../../models/notification-type.model';

import {
  NOTIFICATION_STATUSES,
  NotificationStatus
} from '../../models/notification-status.model';

import {
  NOTIFICATION_READ_FILTERS,
  NotificationReadFilter
} from '../../models/notification-read-filter.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {

  private readonly notificationApiService = inject(NotificationApiService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly permissionService = inject(PermissionService);

  readonly notificationTypes = NOTIFICATION_TYPES;
  readonly notificationStatuses = NOTIFICATION_STATUSES;
  readonly readFilters = NOTIFICATION_READ_FILTERS;

  readonly allNotifications = signal<Notification[]>([]);

  readonly selectedType = signal('');
  readonly selectedStatus = signal('');
  readonly selectedReadFilter = signal<NotificationReadFilter>(
    NotificationReadFilter.ALL
  );

  readonly isLoading = signal(false);

  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly notifications = computed(() => {
    let filtered = [...this.allNotifications()];

    const type = this.selectedType();
    const status = this.selectedStatus();
    const readFilter = this.selectedReadFilter();

    if (type) {
      filtered = filtered.filter(notification =>
        notification.type === type
      );
    }

    if (status) {
      filtered = filtered.filter(notification =>
        notification.status === status
      );
    }

    if (readFilter === NotificationReadFilter.UNREAD) {
      filtered = filtered.filter(notification => !notification.read);
    }

    if (readFilter === NotificationReadFilter.READ) {
      filtered = filtered.filter(notification => notification.read);
    }

    return filtered;
  });

  readonly unreadCount = computed(() =>
    this.allNotifications().filter(notification => !notification.read).length
  );

  readonly readCount = computed(() =>
    this.allNotifications().filter(notification => notification.read).length
  );

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (this.permissionService.isMember()) {
      this.loadMyNotifications();
      return;
    }

    this.loadAllNotifications();
  }

  loadAllNotifications(): void {
    this.isLoading.set(true);

    this.notificationApiService.getAllNotifications(this.page(), this.size())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.allNotifications.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? this.allNotifications().length);
        },
        error: () => {
          this.resetData();
        }
      });
  }

  loadMyNotifications(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token');
      return;
    }

    this.isLoading.set(true);

    this.notificationApiService.getNotificationsByUser(
      userId,
      this.page(),
      this.size()
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.allNotifications.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? this.allNotifications().length);
        },
        error: () => {
          this.resetData();
        }
      });
  }

  private resetData(): void {
    this.allNotifications.set([]);
    this.totalPages.set(0);
    this.totalElements.set(0);
    this.isLoading.set(false);
  }

  applyFilters(): void {
    this.page.set(0);
  }

  clearFilters(): void {
    this.selectedType.set('');
    this.selectedStatus.set('');
    this.selectedReadFilter.set(NotificationReadFilter.ALL);
    this.page.set(0);
    this.loadNotifications();
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value);
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
  }

  onReadFilterChange(value: NotificationReadFilter): void {
    this.selectedReadFilter.set(value);
  }

  markAsRead(notification: Notification): void {
    if (notification.read) {
      return;
    }

    this.notificationApiService.markAsRead(notification.id)
      .subscribe({
        next: response => {
          this.allNotifications.update(notifications =>
            notifications.map(item =>
              item.id === notification.id
                ? {
                    ...item,
                    read: response.read ?? true,
                    readAt: response.readAt ?? item.readAt
                  }
                : item
            )
          );

          this.toastr.success('Notification marked as read');
        }
      });
  }

  async markAllAsRead(): Promise<void> {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm({
      title: 'Mark All Notifications as Read',
      message: 'Are you sure you want to mark all notifications as read?',
      confirmText: 'Mark All Read',
      cancelText: 'Cancel',
      variant: 'primary'
    });

    if (!confirmed) {
      return;
    }

    this.notificationApiService.markAllAsReadByUser(userId)
      .subscribe({
        next: () => {
          this.toastr.success('All notifications marked as read');
          this.loadNotifications();
        }
      });
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      this.loadNotifications();
    }
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadNotifications();
    }
  }

  getStatusClass(status: NotificationStatus): string {
    switch (status) {
      case NotificationStatus.SENT:
        return 'text-bg-success';

      case NotificationStatus.PENDING:
        return 'text-bg-warning';

      case NotificationStatus.FAILED:
        return 'text-bg-danger';

      default:
        return 'text-bg-secondary';
    }
  }

  getReadStatusClass(notification: Notification): string {
    return notification.read ? 'text-bg-secondary' : 'text-bg-primary';
  }

  getReadStatusText(notification: Notification): string {
    return notification.read ? 'Read' : 'Unread';
  }

  getTypeIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.BORROW_CONFIRMATION:
        return 'bi bi-check-circle';

      case NotificationType.RETURN_CONFIRMATION:
        return 'bi bi-arrow-counterclockwise';

      case NotificationType.DUE_DATE_REMINDER:
        return 'bi bi-calendar-event';

      case NotificationType.OVERDUE_REMINDER:
        return 'bi bi-exclamation-triangle';

      default:
        return 'bi bi-bell';
    }
  }

  getTypeLabel(type: NotificationType): string {
    const match = this.notificationTypes.find(item => item.value === type);
    return match?.label ?? type;
  }
}
