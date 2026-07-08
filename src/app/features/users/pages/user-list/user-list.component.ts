import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserApiService } from '../../services/user-api.service';
import { User } from '../../models/user.model';
import {
  MEMBERSHIP_STATUSES,
  MembershipStatus
} from '../../models/membership-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

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
  private readonly router = inject(Router);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  users: User[] = [];
  membershipStatuses = MEMBERSHIP_STATUSES;

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

    this.userApiService.getUsers(this.page, this.size)
      .subscribe({
        next: response => {
          let content = response.content;

          if (this.selectedStatus) {
            content = content.filter(user => user.membershipStatus === this.selectedStatus);
          }

          this.users = content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  applyStatusFilter(): void {
    this.page = 0;
    this.loadUsers();
  }

  clearFilter(): void {
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

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadUsers();
    }
  }

  canEdit(): boolean {
    return this.permissionService.hasPermission(this.permissions.USER_WRITE);
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
}