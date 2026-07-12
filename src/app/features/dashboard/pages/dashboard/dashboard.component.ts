import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PermissionService } from '../../../../core/services/permission.service';
import { DashboardCard } from '../../../../core/models/dashboard-card.model';
import { QuickAction } from '../../../../core/models/quick-action.model';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ROLES } from '../../../../core/constants/roles';

import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary } from '../../models/dashboard-summary.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  public readonly authService = inject(AuthService);
  public readonly permissionService = inject(PermissionService);

  readonly isLoading = signal(false);

  readonly summary = signal<DashboardSummary>({
    totalUsers: 0,
    totalBooks: 0,
    availableBooks: 0,
    lowStockBooks: 0,
    borrowRecords: 0,
    pendingFines: 0,
    notifications: 0,
    memberView: false
  });

  readonly dashboardCards = signal<DashboardCard[]>([
    {
      title: 'Users',
      value: 0,
      description: 'Registered library users',
      icon: 'bi bi-people',
      colorClass: 'card-info',
      permissions: [PERMISSIONS.USER_READ],
      roles: [ROLES.ADMIN]
    },
    {
      title: 'Books',
      value: 0,
      description: 'Books available in catalog',
      icon: 'bi bi-journal-bookmark',
      colorClass: 'card-primary',
      permissions: [PERMISSIONS.BOOK_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      title: 'Available Books',
      value: 0,
      description: 'Books available to borrow',
      icon: 'bi bi-journal-bookmark',
      colorClass: 'card-primary',
      permissions: [PERMISSIONS.BOOK_READ],
      roles: [ROLES.MEMBER]
    },
    {
      title: 'Low Stock',
      value: 0,
      description: 'Books with low available copies',
      icon: 'bi bi-box-seam',
      colorClass: 'card-success',
      permissions: [PERMISSIONS.INVENTORY_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      title: 'Borrow Records',
      value: 0,
      description: 'Borrow and return activity',
      icon: 'bi bi-arrow-left-right',
      colorClass: 'card-warning',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      title: 'My Borrows',
      value: 0,
      description: 'Your borrow and return history',
      icon: 'bi bi-person-lines-fill',
      colorClass: 'card-warning',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.MEMBER]
    },
    {
      title: 'Pending Fines',
      value: 0,
      description: 'Unpaid overdue fine records',
      icon: 'bi bi-cash-coin',
      colorClass: 'card-danger',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      title: 'My Pending Fines',
      value: 0,
      description: 'Your unpaid overdue fines',
      icon: 'bi bi-cash-coin',
      colorClass: 'card-danger',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.MEMBER]
    },
    {
      title: 'Notifications',
      value: 0,
      description: 'Borrow and return alerts',
      icon: 'bi bi-bell',
      colorClass: 'card-secondary',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      title: 'My Notifications',
      value: 0,
      description: 'Your library alerts and reminders',
      icon: 'bi bi-bell',
      colorClass: 'card-secondary',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.MEMBER]
    }
  ]);

  readonly quickActions = signal<QuickAction[]>([
    {
      label: 'Add Book',
      icon: 'bi bi-plus-circle',
      route: '/app/books/create',
      permissions: [PERMISSIONS.BOOK_WRITE],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      label: 'Manage Inventory',
      icon: 'bi bi-box-seam',
      route: '/app/inventory',
      permissions: [PERMISSIONS.INVENTORY_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      label: 'View Users',
      icon: 'bi bi-people',
      route: '/app/users',
      permissions: [PERMISSIONS.USER_READ],
      roles: [ROLES.ADMIN]
    },
    {
      label: 'Borrow Records',
      icon: 'bi bi-arrow-left-right',
      route: '/app/borrow-records',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      label: 'Browse Books',
      icon: 'bi bi-search',
      route: '/app/books',
      permissions: [PERMISSIONS.BOOK_READ]
    },
    {
      label: 'My Borrows',
      icon: 'bi bi-person-lines-fill',
      route: '/app/my-borrows',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.MEMBER]
    },
    {
      label: 'My Fines',
      icon: 'bi bi-cash-coin',
      route: '/app/fines',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: [ROLES.MEMBER]
    }
  ]);

  readonly userEmail = computed(() =>
    this.authService.getEmail() ?? 'User'
  );

  readonly roles = computed(() =>
    this.authService.getRoles()
  );

  readonly permissions = computed(() =>
    this.authService.getPermissions()
  );

  readonly primaryRole = computed(() =>
    this.permissionService.getPrimaryRole()
  );

  readonly welcomeTitle = computed(() => {
    if (this.permissionService.isAdmin()) {
      return 'Admin Dashboard';
    }

    if (this.permissionService.isLibrarian()) {
      return 'Librarian Dashboard';
    }

    if (this.permissionService.isMember()) {
      return 'Member Dashboard';
    }

    return 'Dashboard';
  });

  readonly welcomeDescription = computed(() => {
    if (this.permissionService.isAdmin()) {
      return 'Manage users, books, inventory, borrow records, fines, and notifications.';
    }

    if (this.permissionService.isLibrarian()) {
      return 'Manage book catalog, inventory, borrow records, returns, and fine tracking.';
    }

    if (this.permissionService.isMember()) {
      return 'Browse books, track your borrow records, view due dates, and check fines.';
    }

    return 'Welcome to Smart Library Platform.';
  });

  readonly visibleCards = computed(() => {
    const summary = this.summary();

    return this.dashboardCards()
      .filter(card =>
        this.permissionService.canDisplay(card.permissions, card.roles)
      )
      .map(card => ({
        ...card,
        value: this.getCardValue(card.title, summary)
      }));
  });

  readonly visibleQuickActions = computed(() =>
    this.quickActions().filter(action =>
      this.permissionService.canDisplay(action.permissions, action.roles)
    )
  );

  readonly showAdminPanel = computed(() =>
    this.permissionService.isAdmin()
  );

  readonly showLibrarianPanel = computed(() =>
    this.permissionService.isLibrarian()
  );

  readonly showMemberPanel = computed(() =>
    this.permissionService.isMember()
  );

  ngOnInit(): void {
    this.loadDashboardValues();
  }

  loadDashboardValues(): void {
    this.isLoading.set(true);

    this.dashboardService.loadDashboardSummary()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: summary => {
          this.summary.set({
            totalUsers: summary?.totalUsers ?? 0,
            totalBooks: summary?.totalBooks ?? 0,
            availableBooks: summary?.availableBooks ?? 0,
            lowStockBooks: summary?.lowStockBooks ?? 0,
            borrowRecords: summary?.borrowRecords ?? 0,
            pendingFines: summary?.pendingFines ?? 0,
            notifications: summary?.notifications ?? 0,
            memberView: summary?.memberView ?? false
          });
        },
        error: () => {
          this.summary.set({
            totalUsers: 0,
            totalBooks: 0,
            availableBooks: 0,
            lowStockBooks: 0,
            borrowRecords: 0,
            pendingFines: 0,
            notifications: 0,
            memberView: false
          });
        }
      });
  }

  private getCardValue(title: string, summary: DashboardSummary): number {
    switch (title) {
      case 'Users':
        return summary.totalUsers;

      case 'Books':
        return summary.totalBooks;

      case 'Available Books':
        return summary.availableBooks;

      case 'Low Stock':
        return summary.lowStockBooks;

      case 'Borrow Records':
      case 'My Borrows':
        return summary.borrowRecords;

      case 'Pending Fines':
      case 'My Pending Fines':
        return summary.pendingFines;

      case 'Notifications':
      case 'My Notifications':
        return summary.notifications;

      default:
        return 0;
    }
  }
}
