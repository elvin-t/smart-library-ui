import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PERMISSIONS } from '../../core/constants/permissions';
import { SidebarMenuItem } from '../../core/models/sidebar-menu.model';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  menuItems: SidebarMenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'bi bi-speedometer2',
      route: '/app/dashboard'
    },
    {
      label: 'Users',
      icon: 'bi bi-people',
      route: '/app/users',
      permissions: [PERMISSIONS.USER_READ],
      roles: ['ADMIN']
    },
    {
      label: 'Books',
      icon: 'bi bi-journal-bookmark',
      route: '/app/books',
      permissions: [PERMISSIONS.BOOK_READ]
    },
    {
      label: 'Inventory',
      icon: 'bi bi-box-seam',
      route: '/app/inventory',
      permissions: [PERMISSIONS.INVENTORY_READ],
      roles: ['ADMIN', 'LIBRARIAN']
    },
    {
      label: 'Borrow Records',
      icon: 'bi bi-arrow-left-right',
      route: '/app/borrow-records',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: ['ADMIN', 'LIBRARIAN']
    },
    {
      label: 'My Borrows',
      icon: 'bi bi-person-lines-fill',
      route: '/app/my-borrows',
      permissions: [PERMISSIONS.BORROW_READ],
      roles: ['MEMBER']
    },
    {
      label: 'Fines',
      icon: 'bi bi-cash-coin',
      route: '/app/fines',
      permissions: [PERMISSIONS.BORROW_READ]
    },
    {
      label: 'Notifications',
      icon: 'bi bi-bell',
      route: '/app/notifications',
      permissions: [PERMISSIONS.BORROW_READ]
    }
  ];

  constructor(public permissionService: PermissionService) {}

  visibleMenuItems(): SidebarMenuItem[] {
    return this.menuItems.filter(item =>
      this.permissionService.canDisplay(item.permissions, item.roles)
    );
  }
}