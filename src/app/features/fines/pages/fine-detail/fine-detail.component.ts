import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { FineApiService } from '../../services/fine-api.service';
import { Fine } from '../../models/fine.model';

import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-fine-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './fine-detail.component.html',
  styleUrl: './fine-detail.component.scss'
})
export class FineDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fineApiService = inject(FineApiService);
  private readonly toastr = inject(ToastrService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  borrowRecordId!: number;
  fine?: Fine;

  isLoading = false;
  isSaving = false;

  ngOnInit(): void {
    this.borrowRecordId = Number(this.route.snapshot.paramMap.get('borrowRecordId'));
    this.loadFineDetails();
  }

  loadFineDetails(): void {
    this.isLoading = true;

    this.fineApiService.getFineDetails(this.borrowRecordId)
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

  markFineAsPaid(): void {
    if (!this.fine) {
      return;
    }

    const confirmed = confirm(`Mark fine as paid for borrow record #${this.fine.borrowRecordId}?`);

    if (!confirmed) {
      return;
    }

    this.isSaving = true;

    this.fineApiService.markFineAsPaid(this.fine.borrowRecordId)
      .subscribe({
        next: response => {
          this.fine = response;
          this.toastr.success('Fine marked as paid');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  canPayFine(): boolean {
    return !!this.fine &&
      this.fine.fineAmount > 0 &&
      !this.fine.finePaid &&
      this.permissionService.hasPermission(this.permissions.RETURN_WRITE);
  }

  getPaymentStatusClass(): string {
    return this.fine?.finePaid ? 'text-bg-success' : 'text-bg-danger';
  }

  getPaymentStatusText(): string {
    return this.fine?.finePaid ? 'Paid' : 'Pending';
  }
}