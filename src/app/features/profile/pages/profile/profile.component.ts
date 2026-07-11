import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly userApiService = inject(UserApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  public readonly permissionService = inject(PermissionService);

  user?: User;
  isLoading = false;

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

    this.isLoading = true;

    this.userApiService.getUserById(userId)
      .subscribe({
        next: response => {
          this.user = response;
          this.isLoading = false;
        },
        error: () => {
          this.user = undefined;
          this.isLoading = false;
        }
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/app/dashboard']);
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
