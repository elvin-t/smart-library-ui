import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
import { BorrowRecord } from '../../models/borrow-record.model';
import { BORROW_STATUSES, BorrowStatus } from '../../models/borrow-status.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './borrow-list.component.html',
  styleUrl: './borrow-list.component.scss'
})
export class BorrowListComponent implements OnInit {

  private readonly borrowApiService = inject(BorrowApiService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  borrowRecords: BorrowRecord[] = [];
  statuses = BORROW_STATUSES;

  selectedStatus = '';
  isLoading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadBorrowRecords();
  }

  loadBorrowRecords(): void {
    this.isLoading = true;

    this.borrowApiService.getAllBorrowRecords(this.page, this.size)
      .subscribe({
        next: response => {
          this.borrowRecords = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  filterByStatus(): void {
    this.page = 0;

    if (!this.selectedStatus) {
      this.loadBorrowRecords();
      return;
    }

    this.isLoading = true;

    this.borrowApiService.getBorrowRecordsByStatus(
      this.selectedStatus as BorrowStatus,
      this.page,
      this.size
    ).subscribe({
      next: response => {
        this.borrowRecords = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  clearFilter(): void {
    this.selectedStatus = '';
    this.page = 0;
    this.loadBorrowRecords();
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
          this.loadBorrowRecords();
        }
      });
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadBorrowRecords();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadBorrowRecords();
    }
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