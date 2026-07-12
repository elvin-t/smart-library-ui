import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { PermissionService } from '../../../../core/services/permission.service';

import { UserApiService } from '../../../users/services/user-api.service';
import { User } from '../../../users/models/user.model';
import { MembershipStatus } from '../../../users/models/membership-status.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly userApiService = inject(UserApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly permissionService = inject(PermissionService);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(false);

  readonly roles = computed(() =>
    this.authService.getRoles()
  );

  readonly permissions = computed(() =>
    this.authService.getPermissions()
  );

  readonly primaryRole = computed(() =>
    this.permissionService.getPrimaryRole()
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token. Please login again.');
      this.authService.logout();
      return;
    }

    this.isLoading.set(true);

    this.userApiService.getUserById(userId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.user.set(response);
        },
        error: () => {
          this.user.set(null);
        }
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/app/dashboard']);
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
