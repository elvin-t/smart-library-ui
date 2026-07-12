import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { FineApiService } from '../../services/fine-api.service';
import { FINE_STATUSES, FineStatus } from '../../models/fine-status.model';

import { BorrowRecord } from '../../../borrow/models/borrow-record.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { AuthService } from '../../../auth/services/auth.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-fine-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './fine-list.component.html',
  styleUrl: './fine-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineListComponent implements OnInit {

  private readonly fineApiService = inject(FineApiService);
  private readonly authService = inject(AuthService);
  private readonly permissionService = inject(PermissionService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly permissions = PERMISSIONS;

  readonly fineRecords = signal<BorrowRecord[]>([]);

  readonly fineStatuses = FINE_STATUSES;
  readonly selectedFineStatus = signal<FineStatus>(FineStatus.ALL);

  readonly isLoading = signal(false);

  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

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
    this.isLoading.set(true);

    this.fineApiService.getAllFineRecords(
      this.selectedFineStatus(),
      this.page(),
      this.size()
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.fineRecords.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.resetData();
        }
      });
  }

  loadMemberFines(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastr.error('User ID not found in token');
      return;
    }

    this.isLoading.set(true);

    this.fineApiService.getMyFineRecords(
      userId,
      this.selectedFineStatus(),
      this.page(),
      this.size()
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.fineRecords.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.resetData();
        }
      });
  }

  private resetData(): void {
    this.fineRecords.set([]);
    this.totalPages.set(0);
    this.totalElements.set(0);
  }

  applyFilter(): void {
    this.page.set(0);
    this.loadFines();
  }

  onFineStatusChange(value: FineStatus): void {
    this.selectedFineStatus.set(value);
    this.applyFilter();
  }

  viewFine(record: BorrowRecord): void {
    this.router.navigate(['/app/fines', record.id]);
  }

  async markFineAsPaid(record: BorrowRecord): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: 'Mark Fine as Paid',
      message: `Mark fine as paid for borrow record #${record.id}?`,
      confirmText: 'Mark Paid',
      cancelText: 'Cancel',
      variant: 'success'
    });

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
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadFines();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      this.loadFines();
    }
  }
}
