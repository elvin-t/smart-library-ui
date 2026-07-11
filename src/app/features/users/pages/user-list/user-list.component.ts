import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserApiService } from '../../services/user-api.service';
import { AdminUserApiService } from '../../services/admin-user-api.service';

import { User } from '../../models/user.model';
import { AdminAuthUserStatus } from '../../models/admin-auth-user-status.model';

import {
  MEMBERSHIP_STATUSES,
  MembershipStatus
} from '../../models/membership-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {

  private readonly userApiService = inject(UserApiService);
  private readonly adminUserApiService = inject(AdminUserApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  users: User[] = [];
  allUsers: User[] = [];

  membershipStatuses = MEMBERSHIP_STATUSES;

  keyword = '';
  selectedStatus = '';

  isLoading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.users = [];
    this.allUsers = [];

    const users$ = this.userApiService.getUsers();

    /**
     * This API returns login active/inactive from Auth Service.
     * If it fails, UI will fallback active=true to avoid breaking page.
     */
    const authStatuses$ = this.permissionService.hasPermission(this.permissions.USER_READ)
      ? this.adminUserApiService.getAllAuthUserStatuses().pipe(
          catchError(() => of([] as AdminAuthUserStatus[]))
        )
      : of([] as AdminAuthUserStatus[]);

    forkJoin({
      users: users$,
      authStatuses: authStatuses$
    }).subscribe({
      next: ({ users, authStatuses }) => {
        this.allUsers = this.mergeUsersWithAuthStatus(
          users ?? [],
          authStatuses ?? []
        );

        this.applyLocalFilterAndPagination();
        this.isLoading = false;
      },
      error: () => {
        this.users = [];
        this.allUsers = [];
        this.totalPages = 0;
        this.totalElements = 0;
        this.isLoading = false;
      }
    });
  }

  private mergeUsersWithAuthStatus(
    users: User[],
    authStatuses: AdminAuthUserStatus[]
  ): User[] {
    const statusMap = new Map<number, AdminAuthUserStatus>();

    authStatuses.forEach(status => {
      statusMap.set(status.id, status);
    });

    return users.map(user => {
      const authStatus = statusMap.get(user.id);

      return {
        ...user,
        active: authStatus?.active ?? user.active ?? true
      };
    });
  }

  applyLocalFilterAndPagination(): void {
    let filteredUsers = [...this.allUsers];

    const searchText = this.keyword.trim().toLowerCase();

    if (searchText) {
      filteredUsers = filteredUsers.filter(user =>
        (user.fullName ?? '').toLowerCase().includes(searchText) ||
        (user.email ?? '').toLowerCase().includes(searchText) ||
        (user.phone ?? '').toLowerCase().includes(searchText)
      );
    }

    if (this.selectedStatus) {
      filteredUsers = filteredUsers.filter(user =>
        user.membershipStatus === this.selectedStatus
      );
    }

    this.totalElements = filteredUsers.length;
    this.totalPages = Math.ceil(this.totalElements / this.size);

    if (this.page >= this.totalPages && this.totalPages > 0) {
      this.page = this.totalPages - 1;
    }

    const startIndex = this.page * this.size;
    const endIndex = startIndex + this.size;

    this.users = filteredUsers.slice(startIndex, endIndex);
  }

  searchUsers(): void {
    this.page = 0;
    this.applyLocalFilterAndPagination();
  }

  applyStatusFilter(): void {
    this.page = 0;
    this.applyLocalFilterAndPagination();
  }

  clearFilter(): void {
    this.keyword = '';
    this.selectedStatus = '';
    this.page = 0;
    this.applyLocalFilterAndPagination();
  }

  refreshUsers(): void {
    this.keyword = '';
    this.selectedStatus = '';
    this.page = 0;
    this.loadUsers();
  }

  viewUser(user: User): void {
    this.router.navigate(['/app/users', user.id]);
  }

  editUser(user: User): void {
    this.router.navigate(['/app/users', user.id, 'edit']);
  }

  async activateUser(user: User): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: 'Activate User Login',
      message: `Are you sure you want to activate login access for ${user.email}?`,
      confirmText: 'Activate',
      cancelText: 'Cancel',
      variant: 'success'
    });

    if (!confirmed) {
      return;
    }

    this.adminUserApiService.activateUser(user.id)
      .subscribe({
        next: response => {
          this.toastr.success(response.message || 'User activated successfully');
          user.active = response.active;
          this.loadUsers();
        }
      });
  }

  async deactivateUser(user: User): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: 'Deactivate User Login',
      message: `Are you sure you want to deactivate login access for ${user.email}? This user will not be able to login.`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.adminUserApiService.deactivateUser(user.id)
      .subscribe({
        next: response => {
          this.toastr.success(response.message || 'User deactivated successfully');
          user.active = response.active;
          this.loadUsers();
        }
      });
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.applyLocalFilterAndPagination();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.applyLocalFilterAndPagination();
    }
  }

  canCreate(): boolean {
    return this.permissionService.hasPermission(this.permissions.USER_WRITE);
  }

  canEdit(): boolean {
    return this.permissionService.hasPermission(this.permissions.USER_WRITE);
  }

  canManageLogin(): boolean {
    return this.permissionService.hasPermission(this.permissions.USER_WRITE);
  }

  showActivateButton(user: User): boolean {
    return this.canManageLogin() && user.active === false;
  }

  showDeactivateButton(user: User): boolean {
    return this.canManageLogin() && user.active !== false;
  }

  getStatusClass(status: MembershipStatus): string {
    switch (status) {
      case MembershipStatus.ACTIVE:
        return 'text-bg-success';

      case MembershipStatus.SUSPENDED:
        return 'text-bg-warning';

      case MembershipStatus.EXPIRED:
        return 'text-bg-danger';

      default:
        return 'text-bg-secondary';
    }
  }

  getLoginStatusText(user: User): string {
    return user.active === false ? 'Inactive' : 'Active';
  }

  getLoginStatusClass(user: User): string {
    return user.active === false ? 'text-bg-danger' : 'text-bg-success';
  }
}
