import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
import { BorrowRecord } from '../../models/borrow-record.model';
import { BorrowStatus } from '../../models/borrow-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { AuthService } from '../../../auth/services/auth.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-my-borrows',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './my-borrows.component.html',
  styleUrl: './my-borrows.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBorrowsComponent implements OnInit {

  private readonly borrowApiService = inject(BorrowApiService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  readonly borrowRecords = signal<BorrowRecord[]>([]);

  readonly isLoading = signal(false);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.loadMyBorrows();
  }

  loadMyBorrows(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token');
      return;
    }

    this.isLoading.set(true);

    this.borrowApiService.getBorrowRecordsByUser(
      userId,
      this.page(),
      this.size()
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.borrowRecords.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? this.borrowRecords().length);
        },
        error: () => {
          this.borrowRecords.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
        }
      });
  }

  viewDetails(record: BorrowRecord): void {
    this.router.navigate(['/app/borrow-records', record.id]);
  }

  async returnBook(record: BorrowRecord): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: 'Return Book',
      message: `Are you sure you want to return borrow record #${record.id}?`,
      confirmText: 'Return',
      cancelText: 'Cancel',
      variant: 'success'
    });

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
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadMyBorrows();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
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
