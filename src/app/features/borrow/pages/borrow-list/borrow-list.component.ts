import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
import { BorrowRecord } from '../../models/borrow-record.model';
import { BORROW_STATUSES, BorrowStatus } from '../../models/borrow-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './borrow-list.component.html',
  styleUrl: './borrow-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BorrowListComponent implements OnInit {

  private readonly borrowApiService = inject(BorrowApiService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  readonly borrowRecords = signal<BorrowRecord[]>([]);
  readonly statuses = BORROW_STATUSES;

  readonly selectedStatus = signal('');
  readonly isLoading = signal(false);

  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.loadBorrowRecords();
  }

  loadBorrowRecords(): void {
    this.isLoading.set(true);

    this.borrowApiService.getAllBorrowRecords(this.page(), this.size())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.borrowRecords.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.borrowRecords.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
        }
      });
  }

  filterByStatus(resetPage = true): void {
    if (resetPage) {
      this.page.set(0);
    }

    const status = this.selectedStatus();

    if (!status) {
      this.loadBorrowRecords();
      return;
    }

    this.isLoading.set(true);

    this.borrowApiService.getBorrowRecordsByStatus(
      status as BorrowStatus,
      this.page(),
      this.size()
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.borrowRecords.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.borrowRecords.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
        }
      });
  }

  clearFilter(): void {
    this.selectedStatus.set('');
    this.page.set(0);
    this.loadBorrowRecords();
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    this.filterByStatus();
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
          this.loadCurrentPage();
        }
      });
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadCurrentPage();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      this.loadCurrentPage();
    }
  }

  private loadCurrentPage(): void {
    if (this.selectedStatus()) {
      this.filterByStatus(false);
      return;
    }

    this.loadBorrowRecords();
  }

  canBorrow(): boolean {
    return this.permissionService.hasPermission(this.permissions.BORROW_WRITE);
  }

  canReturn(record: BorrowRecord): boolean {
    return record.status === BorrowStatus.BORROWED &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
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

  getFineClass(record: BorrowRecord): string {
    if (!record.fineAmount || record.fineAmount <= 0) {
      return 'text-muted';
    }

    return record.finePaid ? 'text-success' : 'text-danger';
  }
}
