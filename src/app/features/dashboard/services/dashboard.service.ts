import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { DashboardSummary } from '../models/dashboard-summary.model';

import { PermissionService } from '../../../core/services/permission.service';
import { PERMISSIONS } from '../../../core/constants/permissions';

import { UserApiService } from '../../users/services/user-api.service';
import { BookApiService } from '../../books/services/book-api.service';
import { InventoryApiService } from '../../inventory/services/inventory-api.service';
import { BorrowApiService } from '../../borrow/services/borrow-api.service';
import { NotificationApiService } from '../../notifications/services/notification-api.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly authService = inject(AuthService);
  private readonly permissionService = inject(PermissionService);

  private readonly userApiService = inject(UserApiService);
  private readonly bookApiService = inject(BookApiService);
  private readonly inventoryApiService = inject(InventoryApiService);
  private readonly borrowApiService = inject(BorrowApiService);
  private readonly notificationApiService = inject(NotificationApiService);

  loadDashboardSummary(): Observable<DashboardSummary> {
    const userId = this.authService.getUserId();
    const isMember = this.permissionService.isMember();

    const totalUsers$ = this.permissionService.hasPermission(PERMISSIONS.USER_READ)
      ? this.userApiService.getUsers().pipe(
          map(response => response?.length ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const totalBooks$ = this.permissionService.hasPermission(PERMISSIONS.BOOK_READ)
      ? this.bookApiService.getBooks(0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const availableBooks$ = this.permissionService.hasPermission(PERMISSIONS.BOOK_READ)
      ? this.bookApiService.getAvailableBooks(0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const lowStockBooks$ = this.permissionService.hasPermission(PERMISSIONS.INVENTORY_READ)
      ? this.inventoryApiService.getLowStockBooks(2, 0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const borrowRecords$ = this.permissionService.hasPermission(PERMISSIONS.BORROW_READ)
      ? this.getBorrowRecordCount(isMember, userId)
      : of(0);

    const pendingFines$ = this.permissionService.hasPermission(PERMISSIONS.BORROW_READ)
      ? this.getPendingFineCount(isMember, userId)
      : of(0);

    const notifications$ = this.permissionService.hasPermission(PERMISSIONS.BORROW_READ)
      ? this.getNotificationCount(isMember, userId)
      : of(0);

    return forkJoin({
      totalUsers: totalUsers$,
      totalBooks: totalBooks$,
      availableBooks: availableBooks$,
      lowStockBooks: lowStockBooks$,
      borrowRecords: borrowRecords$,
      pendingFines: pendingFines$,
      notifications: notifications$
    });
  }

  private getBorrowRecordCount(isMember: boolean, userId: number | null): Observable<number> {
    if (isMember && userId) {
      return this.borrowApiService.getBorrowRecordsByUser(userId, 0, 1).pipe(
        map(response => response?.totalElements ?? 0),
        catchError(() => of(0))
      );
    }

    return this.borrowApiService.getAllBorrowRecords(0, 1).pipe(
      map(response => response?.totalElements ?? 0),
      catchError(() => of(0))
    );
  }

  private getPendingFineCount(isMember: boolean, userId: number | null): Observable<number> {
    const request$ = isMember && userId
      ? this.borrowApiService.getBorrowRecordsByUser(userId, 0, 100)
      : this.borrowApiService.getAllBorrowRecords(0, 100);

    return request$.pipe(
      map(response => {
        const records = response?.content ?? [];

        return records.filter(record =>
          (record.fineAmount ?? 0) > 0 && !record.finePaid
        ).length;
      }),
      catchError(() => of(0))
    );
  }

  private getNotificationCount(isMember: boolean, userId: number | null): Observable<number> {
    if (isMember && userId) {
      return this.notificationApiService.getNotificationsByUser(userId, 0, 1).pipe(
        map(response => response?.totalElements ?? 0),
        catchError(() => of(0))
      );
    }

    return this.notificationApiService.getAllNotifications(0, 1).pipe(
      map(response => response?.totalElements ?? 0),
      catchError(() => of(0))
    );
  }
}
