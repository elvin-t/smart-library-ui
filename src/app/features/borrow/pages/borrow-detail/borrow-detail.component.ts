import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
import { BorrowRecord } from '../../models/borrow-record.model';
import { BorrowStatus } from '../../models/borrow-status.model';
import { FineResponse } from '../../models/fine-response.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-borrow-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './borrow-detail.component.html',
  styleUrl: './borrow-detail.component.scss'
})
export class BorrowDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly borrowApiService = inject(BorrowApiService);
  private readonly toastr = inject(ToastrService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  borrowRecordId!: number;
  record?: BorrowRecord;
  fine?: FineResponse;

  isLoading = false;
  isSaving = false;

  ngOnInit(): void {
    this.borrowRecordId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetails();
  }

  loadDetails(): void {
    this.isLoading = true;

    this.borrowApiService.getBorrowRecordById(this.borrowRecordId)
      .subscribe({
        next: response => {
          this.record = response;
          this.loadFineDetails();
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  loadFineDetails(): void {
    this.borrowApiService.getFineDetails(this.borrowRecordId)
      .subscribe({
        next: response => {
          this.fine = response;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  returnBook(): void {
    if (!this.record) {
      return;
    }

    const confirmed = confirm(`Are you sure you want to return borrow record #${this.record.id}?`);

    if (!confirmed) {
      return;
    }

    this.isSaving = true;

    this.borrowApiService.returnBook(this.record.id)
      .subscribe({
        next: response => {
          this.record = response;
          this.toastr.success('Book returned successfully');
          this.loadFineDetails();
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  markFineAsPaid(): void {
    if (!this.record) {
      return;
    }

    const confirmed = confirm(`Mark fine as paid for borrow record #${this.record.id}?`);

    if (!confirmed) {
      return;
    }

    this.isSaving = true;

    this.borrowApiService.markFineAsPaid(this.record.id)
      .subscribe({
        next: response => {
          this.fine = response;

          if (this.record) {
            this.record.finePaid = response.finePaid;
            this.record.finePaidAt = response.finePaidAt;
          }

          this.toastr.success('Fine marked as paid');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  canReturn(): boolean {
    return this.record?.status === BorrowStatus.BORROWED &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  }

  canPayFine(): boolean {
    return !!this.fine &&
      this.fine.fineAmount > 0 &&
      !this.fine.finePaid &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  }

  getStatusClass(status?: BorrowStatus): string {
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