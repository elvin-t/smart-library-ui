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

import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';

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

  notificationTypes = NOTIFICATION_TYPES;
  notificationStatuses = NOTIFICATION_STATUSES;

  selectedType = '';
  selectedStatus = '';

  isLoading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (this.selectedType) {
      this.loadByType();
      return;
    }

    if (this.selectedStatus) {
      this.loadByStatus();
      return;
    }

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
          this.notifications = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
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
          this.notifications = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  loadByType(): void {
    this.isLoading = true;

    this.notificationApiService.getNotificationsByType(
      this.selectedType as NotificationType,
      this.page,
      this.size
    ).subscribe({
      next: response => {
        this.notifications = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadByStatus(): void {
    this.isLoading = true;

    this.notificationApiService.getNotificationsByStatus(
      this.selectedStatus as NotificationStatus,
      this.page,
      this.size
    ).subscribe({
      next: response => {
        this.notifications = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.loadNotifications();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedStatus = '';
    this.page = 0;
    this.loadNotifications();
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