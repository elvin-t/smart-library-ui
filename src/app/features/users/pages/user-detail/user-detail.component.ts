import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UserApiService } from '../../services/user-api.service';
import { User } from '../../models/user.model';
import { MembershipStatus } from '../../models/membership-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

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

    this.userApiService.getUserById(this.userId)
      .subscribe({
        next: response => {
          this.user = response;
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
}