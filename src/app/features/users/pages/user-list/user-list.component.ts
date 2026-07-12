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
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin, of } from 'rxjs';
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
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {

  private readonly userApiService = inject(UserApiService);
  private readonly adminUserApiService = inject(AdminUserApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly permissionService = inject(PermissionService);

  readonly permissions = PERMISSIONS;
  readonly membershipStatuses = MEMBERSHIP_STATUSES;

  readonly allUsers = signal<User[]>([]);
  readonly keyword = signal('');
  readonly selectedStatus = signal('');
  readonly isLoading = signal(false);

  readonly page = signal(0);
  readonly size = signal(10);

  readonly filteredUsers = computed(() => {
    let filteredUsers = [...this.allUsers()];

    const searchText = this.keyword().trim().toLowerCase();
    const status = this.selectedStatus();

    if (searchText) {
      filteredUsers = filteredUsers.filter(user =>
        (user.fullName ?? '').toLowerCase().includes(searchText) ||
        (user.email ?? '').toLowerCase().includes(searchText) ||
        (user.phone ?? '').toLowerCase().includes(searchText)
      );
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user =>
        user.membershipStatus === status
      );
    }

    return filteredUsers;
  });

  readonly totalElements = computed(() =>
    this.filteredUsers().length
  );

  readonly totalPages = computed(() =>
    Math.ceil(this.totalElements() / this.size())
  );

  readonly users = computed(() => {
    const totalPages = this.totalPages();

    if (this.page() >= totalPages && totalPages > 0) {
      this.page.set(totalPages - 1);
    }

    const startIndex = this.page() * this.size();
    const endIndex = startIndex + this.size();

    return this.filteredUsers().slice(startIndex, endIndex);
  });

  readonly canCreate = computed(() =>
    this.permissionService.hasPermission(this.permissions.USER_WRITE)
  );

  readonly canEdit = computed(() =>
    this.permissionService.hasPermission(this.permissions.USER_WRITE)
  );

  readonly canManageLogin = computed(() =>
    this.permissionService.hasPermission(this.permissions.USER_WRITE)
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.allUsers.set([]);
    this.page.set(0);

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
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ users, authStatuses }) => {
          const mergedUsers = this.mergeUsersWithAuthStatus(
            users ?? [],
            authStatuses ?? []
          );

          this.allUsers.set(mergedUsers);
          this.page.set(0);
        },
        error: () => {
          this.allUsers.set([]);
          this.page.set(0);
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

  searchUsers(): void {
    this.page.set(0);
  }

  applyStatusFilter(): void {
    this.page.set(0);
  }

  clearFilter(): void {
    this.keyword.set('');
    this.selectedStatus.set('');
    this.page.set(0);
  }

  refreshUsers(): void {
    this.keyword.set('');
    this.selectedStatus.set('');
    this.page.set(0);
    this.loadUsers();
  }

  onKeywordChange(value: string): void {
    this.keyword.set(value);
    this.page.set(0);
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    this.page.set(0);
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

          this.allUsers.update(users =>
            users.map(item =>
              item.id === user.id
                ? { ...item, active: response.active }
                : item
            )
          );
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

          this.allUsers.update(users =>
            users.map(item =>
              item.id === user.id
                ? { ...item, active: response.active }
                : item
            )
          );
        }
      });
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
    }
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
