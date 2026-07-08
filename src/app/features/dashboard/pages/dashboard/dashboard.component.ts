import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


import { PermissionService } from '../../../../core/services/permission.service';
import { DashboardCard } from '../../../../core/models/dashboard-card.model';
import { QuickAction } from '../../../../core/models/quick-action.model';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ROLES } from '../../../../core/constants/roles';
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
export class DashboardComponent {

  dashboardCards: DashboardCard[] = [
    {
      title: 'Users',
      value: '--',
      description: 'Manage registered library users',
      icon: 'bi bi-people',
      colorClass: 'card-info',
      permissions: [PERMISSIONS.USER_READ],
      roles: [ROLES.ADMIN]
    },
    {
      title: 'Books',
      value: '--',
      description: 'View and manage book catalog',
      icon: 'bi bi-journal-bookmark',
      colorClass: 'card-primary',
      permissions: [PERMISSIONS.BOOK_READ]
    },
    {
      title: 'Inventory',
      value: '--',
      description: 'Track book stock and availability',
      icon: 'bi bi-box-seam',
      colorClass: 'card-success',
      permissions: [PERMISSIONS.INVENTORY_READ],
      roles: [ROLES.ADMIN, ROLES.LIBRARIAN]
    },
    {
      title: 'Borrow Records',
      value: '--',
      description: 'Monitor borrow and return activity',
      icon: 'bi bi-arrow-left-right',
      colorClass: 'card-warning',
      permissions: [PERMISSIONS.BORROW_READ]
    },
    {
      title: 'Fines',
      value: '--',
      description: 'Track overdue fines and payments',
      icon: 'bi bi-cash-coin',
      colorClass: 'card-danger',
      permissions: [PERMISSIONS.BORROW_READ]
    },
    {
      title: 'Notifications',
      value: '--',
      description: 'Borrow, return, and reminder alerts',
      icon: 'bi bi-bell',
      colorClass: 'card-secondary'
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