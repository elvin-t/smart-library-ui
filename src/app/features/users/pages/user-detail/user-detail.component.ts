import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin, of } from 'rxjs';
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
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly userApiService = inject(UserApiService);
  private readonly adminUserApiService = inject(AdminUserApiService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  readonly userId = signal<number | null>(null);
  readonly user = signal<User | null>(null);
  readonly isLoading = signal(false);

  readonly showActivateButton = computed(() => {
    const user = this.user();

    return !!user &&
      this.canManageLogin() &&
      user.active === false;
  });

  readonly showDeactivateButton = computed(() => {
    const user = this.user();

    return !!user &&
      this.canManageLogin() &&
      user.active !== false;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.userId.set(id);
    this.loadUser();
  }

  loadUser(): void {
    const id = this.userId();

    if (!id) {
      this.user.set(null);
      return;
    }

    this.isLoading.set(true);

    const user$ = this.userApiService.getUserById(id);

    const authStatus$ = this.permissionService.hasPermission(this.permissions.USER_READ)
      ? this.adminUserApiService.getAuthUserStatus(id).pipe(
          catchError(() => of(undefined as AdminAuthUserStatus | undefined))
        )
      : of(undefined as AdminAuthUserStatus | undefined);

    forkJoin({
      user: user$,
      authStatus: authStatus$
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ user, authStatus }) => {
          this.user.set({
            ...user,
            active: authStatus?.active ?? user.active ?? true
          });
        },
        error: () => {
          this.user.set(null);
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
    const user = this.user();

    if (!user) {
      return;
    }

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

          this.user.update(currentUser =>
            currentUser
              ? { ...currentUser, active: response.active }
              : currentUser
          );

          this.loadUser();
        }
      });
  }

  async deactivateUser(): Promise<void> {
    const user = this.user();

    if (!user) {
      return;
    }

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

          this.user.update(currentUser =>
            currentUser
              ? { ...currentUser, active: response.active }
              : currentUser
          );

          this.loadUser();
        }
      });
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
    return this.user()?.active === false ? 'Inactive' : 'Active';
  }

  getLoginStatusClass(): string {
    return this.user()?.active === false ? 'text-bg-danger' : 'text-bg-success';
  }
}
