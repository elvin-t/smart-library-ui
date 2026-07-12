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

import { FineApiService } from '../../services/fine-api.service';
import { Fine } from '../../models/fine.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-fine-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './fine-detail.component.html',
  styleUrl: './fine-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fineApiService = inject(FineApiService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  readonly borrowRecordId = signal<number | null>(null);
  readonly fine = signal<Fine | null>(null);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly canPayFine = computed(() => {
    const fine = this.fine();

    return !!fine &&
      fine.fineAmount > 0 &&
      !fine.finePaid &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('borrowRecordId'));

    this.borrowRecordId.set(id);

    this.loadFineDetails();
  }

  loadFineDetails(): void {
    const borrowRecordId = this.borrowRecordId();

    if (!borrowRecordId) {
      this.fine.set(null);
      return;
    }

    this.isLoading.set(true);

    this.fineApiService.getFineDetails(borrowRecordId)
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

  async markFineAsPaid(): Promise<void> {
    const fine = this.fine();

    if (!fine) {
      return;
    }

    const confirmed = await this.confirmDialogService.confirm({
      title: 'Mark Fine as Paid',
      message: `Mark fine as paid for borrow record #${fine.borrowRecordId}?`,
      confirmText: 'Mark Paid',
      cancelText: 'Cancel',
      variant: 'success'
    });

    if (!confirmed) {
      return;
    }

    this.isSaving.set(true);

    this.fineApiService.markFineAsPaid(fine.borrowRecordId)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.fine.set(response);
          this.toastr.success('Fine marked as paid');
        }
      });
  }

  getPaymentStatusClass(): string {
    return this.fine()?.finePaid ? 'text-bg-success' : 'text-bg-danger';
  }

  getPaymentStatusText(): string {
    return this.fine()?.finePaid ? 'Paid' : 'Pending';
  }
}
