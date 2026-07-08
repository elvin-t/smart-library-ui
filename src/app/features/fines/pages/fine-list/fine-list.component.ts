import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { FineApiService } from '../../services/fine-api.service';
import { FINE_STATUSES, FineStatus } from '../../models/fine-status.model';

import { BorrowRecord } from '../../../borrow/models/borrow-record.model';

import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-fine-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './fine-list.component.html',
  styleUrl: './fine-list.component.scss'
})
export class FineListComponent implements OnInit {

  private readonly fineApiService = inject(FineApiService);
  private readonly authService = inject(AuthService);
  private readonly permissionServiceInternal = inject(PermissionService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  public readonly permissionService = this.permissionServiceInternal;
  public readonly permissions = PERMISSIONS;

  fineRecords: BorrowRecord[] = [];

  fineStatuses = FINE_STATUSES;
  selectedFineStatus: FineStatus = FineStatus.ALL;

  isLoading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadFines();
  }

  loadFines(): void {
    if (this.permissionService.isMember()) {
      this.loadMemberFines();
      return;
    }

    this.loadAllFines();
  }

  loadAllFines(): void {
    this.isLoading = true;

    this.fineApiService.getAllFineRecords(
      this.selectedFineStatus,
      this.page,
      this.size
    ).subscribe({
      next: response => {
        this.fineRecords = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadMemberFines(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token');
      return;
    }

    this.isLoading = true;

    this.fineApiService.getMyFineRecords(
      userId,
      this.selectedFineStatus,
      this.page,
      this.size
    ).subscribe({
      next: response => {
        this.fineRecords = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.page = 0;
    this.loadFines();
  }

  viewFine(record: BorrowRecord): void {
    this.router.navigate(['/app/fines', record.id]);
  }

  markFineAsPaid(record: BorrowRecord): void {
    const confirmed = confirm(`Mark fine as paid for borrow record #${record.id}?`);

    if (!confirmed) {
      return;
    }

    this.fineApiService.markFineAsPaid(record.id)
      .subscribe({
        next: () => {
          this.toastr.success('Fine marked as paid');
          this.loadFines();
        }
      });
  }

  canPayFine(record: BorrowRecord): boolean {
    return (record.fineAmount ?? 0) > 0 &&
      !record.finePaid &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  }

  getFineClass(record: BorrowRecord): string {
    if (record.finePaid) {
      return 'text-success';
    }

    return 'text-danger';
  }

  getPaymentStatusClass(record: BorrowRecord): string {
    return record.finePaid ? 'text-bg-success' : 'text-bg-danger';
  }

  getPaymentStatusText(record: BorrowRecord): string {
    return record.finePaid ? 'Paid' : 'Pending';
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadFines();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadFines();
    }
  }
}