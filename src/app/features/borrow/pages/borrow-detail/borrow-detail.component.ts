import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
import { BorrowRecord } from '../../models/borrow-record.model';
import { BorrowStatus } from '../../models/borrow-status.model';
import { FineResponse } from '../../models/fine-response.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-borrow-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './borrow-detail.component.html',
  styleUrl: './borrow-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BorrowDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly borrowApiService = inject(BorrowApiService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  readonly borrowRecordId = signal<number | null>(null);
  readonly record = signal<BorrowRecord | null>(null);
  readonly fine = signal<FineResponse | null>(null);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly canReturn = computed(() => {
    const record = this.record();

    return !!record &&
      record.status === BorrowStatus.BORROWED &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  });

  readonly canPayFine = computed(() => {
    const fine = this.fine();

    return !!fine &&
      fine.fineAmount > 0 &&
      !fine.finePaid &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.borrowRecordId.set(id);

    this.loadDetails();
  }

  loadDetails(): void {
    const borrowRecordId = this.borrowRecordId();

    if (!borrowRecordId) {
      this.record.set(null);
      this.fine.set(null);
      return;
    }

    this.isLoading.set(true);

    this.borrowApiService.getBorrowRecordById(borrowRecordId)
      .subscribe({
        next: response => {
          this.record.set(response);
          this.loadFineDetails();
        },
        error: () => {
          this.record.set(null);
          this.fine.set(null);
          this.isLoading.set(false);
        }
      });
  }

  loadFineDetails(): void {
    const borrowRecordId = this.borrowRecordId();

    if (!borrowRecordId) {
      this.fine.set(null);
      this.isLoading.set(false);
      return;
    }

    this.borrowApiService.getFineDetails(borrowRecordId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.fine.set(response);
        },
        error: () => {
          this.fine.set(null);
        }
      });
  }

  async returnBook(): Promise<void> {
    const record = this.record();

    if (!record) {
      return;
    }

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

    this.isSaving.set(true);

    this.borrowApiService.returnBook(record.id)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.record.set(response);
          this.toastr.success('Book returned successfully');
          this.loadFineDetails();
        }
      });
  }

  async markFineAsPaid(): Promise<void> {
    const record = this.record();

    if (!record) {
      return;
    }

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

    this.isSaving.set(true);

    this.borrowApiService.markFineAsPaid(record.id)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.fine.set(response);

          this.record.update(currentRecord =>
            currentRecord
              ? {
                  ...currentRecord,
                  finePaid: response.finePaid,
                  finePaidAt: response.finePaidAt
                }
              : currentRecord
          );

          this.toastr.success('Fine marked as paid');
        }
      });
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
