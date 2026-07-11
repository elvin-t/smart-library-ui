import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
import { BorrowRecord } from '../../models/borrow-record.model';
import { BorrowStatus } from '../../models/borrow-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-my-borrows',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './my-borrows.component.html',
  styleUrl: './my-borrows.component.scss'
})
export class MyBorrowsComponent implements OnInit {

  private readonly borrowApiService = inject(BorrowApiService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  borrowRecords: BorrowRecord[] = [];

  isLoading = false;
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadMyBorrows();
  }

  loadMyBorrows(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token');
      return;
    }

    this.isLoading = true;

    this.borrowApiService.getBorrowRecordsByUser(userId, this.page, this.size)
      .subscribe({
        next: response => {
          this.borrowRecords = response?.content ?? [];
          this.totalPages = response?.totalPages ?? 0;
          this.totalElements = response?.totalElements ?? this.borrowRecords.length;
          this.isLoading = false;
        },
        error: () => {
          this.borrowRecords = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.isLoading = false;
        }
      });
  }

  viewDetails(record: BorrowRecord): void {
    this.router.navigate(['/app/borrow-records', record.id]);
  }

  returnBook(record: BorrowRecord): void {
    const confirmed = confirm(`Are you sure you want to return borrow record #${record.id}?`);

    if (!confirmed) {
      return;
    }

    this.borrowApiService.returnBook(record.id)
      .subscribe({
        next: () => {
          this.toastr.success('Book returned successfully');
          this.loadMyBorrows();
        }
      });
  }

  canReturn(record: BorrowRecord): boolean {
    return record.status === BorrowStatus.BORROWED &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadMyBorrows();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadMyBorrows();
    }
  }

  getStatusClass(status: BorrowStatus): string {
    switch (status) {
      case BorrowStatus.BORROWED:
        return 'text-bg-primary';

      case BorrowStatus.RETURNED:
        return 'text-bg-success';

      case BorrowStatus.OVERDUE:
        return 'text-bg-danger';

      default:
        return 'text-bg-secondary';
    }
  }
}
