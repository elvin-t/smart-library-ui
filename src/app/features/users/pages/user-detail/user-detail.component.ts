import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserApiService } from '../../services/user-api.service';
import { AdminUserApiService } from '../../services/admin-user-api.service';

import { User } from '../../models/user.model';
import { MembershipStatus } from '../../models/membership-status.model';
import { AdminAuthUserStatus } from '../../models/admin-auth-user-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly userApiService = inject(UserApiService);
  private readonly adminUserApiService = inject(AdminUserApiService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  userId!: number;
  user?: User;
  isLoading = false;

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading = true;

    const user$ = this.userApiService.getUserById(this.userId);

    const authStatus$ = this.permissionService.hasPermission(this.permissions.USER_READ)
      ? this.adminUserApiService.getAuthUserStatus(this.userId).pipe(
          catchError(() => of(undefined as AdminAuthUserStatus | undefined))
        )
      : of(undefined as AdminAuthUserStatus | undefined);

    forkJoin({
      user: user$,
      authStatus: authStatus$
    }).subscribe({
      next: ({ user, authStatus }) => {
        this.user = {
          ...user,
          active: authStatus?.active ?? user.active ?? true
        };

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  canEdit(): boolean {
    return this.permissionService.hasPermission(this.permissions.USER_WRITE);
  }

  canManageLogin(): boolean {
    return this.permissionService.hasPermission(this.permissions.USER_WRITE);
  }

  async activateUser(): Promise<void> {
    if (!this.user) {
      return;
    }

    const confirmed = await this.confirmDialogService.confirm({
      title: 'Activate User Login',
      message: `Are you sure you want to activate login access for ${this.user.email}?`,
      confirmText: 'Activate',
      cancelText: 'Cancel',
      variant: 'success'
    });

    if (!confirmed) {
      return;
    }

    this.adminUserApiService.activateUser(this.user.id)
      .subscribe({
        next: response => {
          this.toastr.success(response.message || 'User activated successfully');

          if (this.user) {
            this.user.active = response.active;
          }

          this.loadUser();
        }
      });
  }

  async deactivateUser(): Promise<void> {
    if (!this.user) {
      return;
    }

    const confirmed = await this.confirmDialogService.confirm({
      title: 'Deactivate User Login',
      message: `Are you sure you want to deactivate login access for ${this.user.email}? This user will not be able to login.`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.adminUserApiService.deactivateUser(this.user.id)
      .subscribe({
        next: response => {
          this.toastr.success(response.message || 'User deactivated successfully');

          if (this.user) {
            this.user.active = response.active;
          }

          this.loadUser();
        }
      });
  }

  showActivateButton(): boolean {
    return !!this.user &&
      this.canManageLogin() &&
      this.user.active === false;
  }

  showDeactivateButton(): boolean {
    return !!this.user &&
      this.canManageLogin() &&
      this.user.active !== false;
  }

  getStatusClass(status?: MembershipStatus): string {
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

  getLoginStatusText(): string {
    return this.user?.active === false ? 'Inactive' : 'Active';
  }

  getLoginStatusClass(): string {
    return this.user?.active === false ? 'text-bg-danger' : 'text-bg-success';
  }
}
