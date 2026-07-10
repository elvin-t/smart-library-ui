import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, catchError } from 'rxjs';

import { UserApiService } from '../../users/services/user-api.service';
import { BookApiService } from '../../books/services/book-api.service';
import { InventoryApiService } from '../../inventory/services/inventory-api.service';
import { BorrowApiService } from '../../borrow/services/borrow-api.service';
import { NotificationApiService } from '../../notifications/services/notification-api.service';

import { DashboardSummary } from '../models/dashboard-summary.model';
import { PermissionService } from '../../../core/services/permission.service';
import { PERMISSIONS } from '../../../core/constants/permissions';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly userApiService = inject(UserApiService);
  private readonly bookApiService = inject(BookApiService);
  private readonly inventoryApiService = inject(InventoryApiService);
  private readonly borrowApiService = inject(BorrowApiService);
  private readonly notificationApiService = inject(NotificationApiService);
  private readonly permissionService = inject(PermissionService);

  loadDashboardSummary(): Observable<DashboardSummary> {

    const users$ = this.permissionService.hasPermission(PERMISSIONS.USER_READ)
      ? this.userApiService.getUsers(0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const books$ = this.permissionService.hasPermission(PERMISSIONS.BOOK_READ)
      ? this.bookApiService.getBooks(0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const lowStock$ = this.permissionService.hasPermission(PERMISSIONS.INVENTORY_READ)
      ? this.inventoryApiService.getLowStockBooks(2, 0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const borrowRecords$ = this.permissionService.hasPermission(PERMISSIONS.BORROW_READ)
      ? this.borrowApiService.getAllBorrowRecords(0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    const pendingFines$ = this.permissionService.hasPermission(PERMISSIONS.BORROW_READ)
      ? this.borrowApiService.getAllBorrowRecords(0, 100).pipe(
          map(response => {
            const records = response?.content ?? [];

            return records.filter(record =>
              (record.fineAmount ?? 0) > 0 && !record.finePaid
            ).length;
          }),
          catchError(() => of(0))
        )
      : of(0);

    const notifications$ = this.permissionService.hasPermission(PERMISSIONS.BORROW_READ)
      ? this.notificationApiService.getAllNotifications(0, 1).pipe(
          map(response => response?.totalElements ?? 0),
          catchError(() => of(0))
        )
      : of(0);

    return forkJoin({
      totalUsers: users$,
      totalBooks: books$,
      lowStockBooks: lowStock$,
      borrowRecords: borrowRecords$,
      pendingFines: pendingFines$,
      notifications: notifications$
    });
  }
}