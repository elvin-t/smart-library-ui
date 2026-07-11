import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {

  private readonly notificationApiService = inject(NotificationApiService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  public readonly permissionService = inject(PermissionService);

  notifications: Notification[] = [];
  allNotifications: Notification[] = [];

  notificationTypes = NOTIFICATION_TYPES;
  notificationStatuses = NOTIFICATION_STATUSES;
  readFilters = NOTIFICATION_READ_FILTERS;

  selectedType = '';
  selectedStatus = '';
  selectedReadFilter: NotificationReadFilter = NotificationReadFilter.ALL;

  isLoading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

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
    this.isLoading = true;

    this.notificationApiService.getAllNotifications(this.page, this.size)
      .subscribe({
        next: response => {
          this.allNotifications = response?.content ?? [];
          this.totalPages = response?.totalPages ?? 0;
          this.totalElements = response?.totalElements ?? this.allNotifications.length;
          this.applyLocalFilters();
          this.isLoading = false;
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

    this.isLoading = true;

    this.notificationApiService.getNotificationsByUser(userId, this.page, this.size)
      .subscribe({
        next: response => {
          this.allNotifications = response?.content ?? [];
          this.totalPages = response?.totalPages ?? 0;
          this.totalElements = response?.totalElements ?? this.allNotifications.length;
          this.applyLocalFilters();
          this.isLoading = false;
        },
        error: () => {
          this.resetData();
        }
      });
  }

  private resetData(): void {
    this.notifications = [];
    this.allNotifications = [];
    this.totalPages = 0;
    this.totalElements = 0;
    this.isLoading = false;
  }

  applyFilters(): void {
    this.page = 0;
    this.applyLocalFilters();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedStatus = '';
    this.selectedReadFilter = NotificationReadFilter.ALL;
    this.page = 0;
    this.loadNotifications();
  }

  applyLocalFilters(): void {
    let filtered = [...this.allNotifications];

    if (this.selectedType) {
      filtered = filtered.filter(notification =>
        notification.type === this.selectedType
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(notification =>
        notification.status === this.selectedStatus
      );
    }

    if (this.selectedReadFilter === NotificationReadFilter.UNREAD) {
      filtered = filtered.filter(notification => !notification.read);
    }

    if (this.selectedReadFilter === NotificationReadFilter.READ) {
      filtered = filtered.filter(notification => notification.read);
    }

    this.notifications = filtered;
  }

  markAsRead(notification: Notification): void {
    if (notification.read) {
      return;
    }

    this.notificationApiService.markAsRead(notification.id)
      .subscribe({
        next: response => {
          notification.read = response.read;
          notification.readAt = response.readAt;
          this.toastr.success('Notification marked as read');
          this.applyLocalFilters();
        }
      });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token');
      return;
    }

    const confirmed = confirm('Mark all notifications as read?');

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
    if (this.page > 0) {
      this.page--;
      this.loadNotifications();
    }
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadNotifications();
    }
  }

  get unreadCount(): number {
    return this.allNotifications.filter(notification => !notification.read).length;
  }

  get readCount(): number {
    return this.allNotifications.filter(notification => notification.read).length;
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
