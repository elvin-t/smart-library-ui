import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';


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
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);

  isLoading = false;

  dashboardCards: DashboardCard[] = [
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
      permissions: [PERMISSIONS.BOOK_READ]
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
      permissions: [PERMISSIONS.BORROW_READ]
    },
    {
      title: 'Pending Fines',
      value: 0,
      description: 'Unpaid overdue fine records',
      icon: 'bi bi-cash-coin',
      colorClass: 'card-danger',
      permissions: [PERMISSIONS.BORROW_READ]
    },
    {
      title: 'Notifications',
      value: 0,
      description: 'Borrow and return alerts',
      icon: 'bi bi-bell',
      colorClass: 'card-secondary',
      permissions: [PERMISSIONS.BORROW_READ]
    }
  ];

  quickActions: QuickAction[] = [
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
  ];

  constructor(
    public authService: AuthService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardValues();
  }

  loadDashboardValues(): void {
    this.isLoading = true;

    this.dashboardService.loadDashboardSummary()
      .subscribe({
        next: summary => {
          this.updateCardValues(summary);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private updateCardValues(summary: DashboardSummary): void {
    this.dashboardCards = this.dashboardCards.map(card => {
      switch (card.title) {
        case 'Users':
          return { ...card, value: summary.totalUsers };

        case 'Books':
          return { ...card, value: summary.totalBooks };

        case 'Low Stock':
          return { ...card, value: summary.lowStockBooks };

        case 'Borrow Records':
          return { ...card, value: summary.borrowRecords };

        case 'Pending Fines':
          return { ...card, value: summary.pendingFines };

        case 'Notifications':
          return { ...card, value: summary.notifications };

        default:
          return card;
      }
    });
  }

  get userEmail(): string {
    return this.authService.getEmail() ?? 'User';
  }

  get roles(): string[] {
    return this.authService.getRoles();
  }

  get permissions(): string[] {
    return this.authService.getPermissions();
  }

  get primaryRole(): string {
    return this.permissionService.getPrimaryRole();
  }

  get welcomeTitle(): string {
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
  }

  get welcomeDescription(): string {
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
  }

  visibleCards(): DashboardCard[] {
    return this.dashboardCards.filter(card =>
      this.permissionService.canDisplay(card.permissions, card.roles)
    );
  }

  visibleQuickActions(): QuickAction[] {
    return this.quickActions.filter(action =>
      this.permissionService.canDisplay(action.permissions, action.roles)
    );
  }

  showAdminPanel(): boolean {
    return this.permissionService.isAdmin();
  }

  showLibrarianPanel(): boolean {
    return this.permissionService.isLibrarian();
  }

  showMemberPanel(): boolean {
    return this.permissionService.isMember();
  }
}