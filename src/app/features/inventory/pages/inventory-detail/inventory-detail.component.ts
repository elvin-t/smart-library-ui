import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { InventoryApiService } from '../../services/inventory-api.service';
import { Inventory } from '../../models/inventory.model';
import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.scss'
})
export class InventoryDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly inventoryApiService = inject(InventoryApiService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  bookId!: number;
  inventory?: Inventory;
  isLoading = false;
  isSaving = false;

  addCopiesForm = this.formBuilder.group({
    copies: [1, [Validators.required, Validators.min(1)]]
  });

  removeCopiesForm = this.formBuilder.group({
    copies: [1, [Validators.required, Validators.min(1)]]
  });

  adjustAvailableForm = this.formBuilder.group({
    availableCopies: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.bookId = Number(this.route.snapshot.paramMap.get('bookId'));
    this.loadInventory();
  }

  loadInventory(): void {
    this.isLoading = true;

    this.inventoryApiService.getInventoryByBookId(this.bookId)
      .subscribe({
        next: response => {
          this.inventory = response;
          this.adjustAvailableForm.patchValue({
            availableCopies: response.availableCopies
          });
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  addCopies(): void {
    if (this.addCopiesForm.invalid) {
      this.addCopiesForm.markAllAsTouched();
      return;
    }

    const copies = Number(this.addCopiesForm.value.copies);

    this.isSaving = true;

    this.inventoryApiService.addCopies(this.bookId, { copies })
      .subscribe({
        next: response => {
          this.inventory = response;
          this.addCopiesForm.patchValue({ copies: 1 });
          this.toastr.success('Copies added successfully');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  async removeCopies(): Promise<void> {
  if (this.removeCopiesForm.invalid) {
    this.removeCopiesForm.markAllAsTouched();
    return;
  }

  const copies = Number(this.removeCopiesForm.value.copies);

  const confirmed = await this.confirmDialogService.confirm({
    title: 'Remove Copies',
    message: `Are you sure you want to remove ${copies} copies?`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    variant: 'danger'
  });

  if (!confirmed) {
    return;
  }

  this.isSaving = true;

  this.inventoryApiService.removeCopies(this.bookId, { copies })
    .subscribe({
      next: response => {
        this.inventory = response;
        this.removeCopiesForm.patchValue({ copies: 1 });
        this.toastr.success('Copies removed successfully');
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      }
    });
}

  adjustAvailableCopies(): void {
    if (this.adjustAvailableForm.invalid) {
      this.adjustAvailableForm.markAllAsTouched();
      return;
    }

    const availableCopies = Number(this.adjustAvailableForm.value.availableCopies);

    this.isSaving = true;

    this.inventoryApiService.adjustAvailableCopies(this.bookId, { availableCopies })
      .subscribe({
        next: response => {
          this.inventory = response;
          this.toastr.success('Available copies updated successfully');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  canWriteInventory(): boolean {
    return this.permissionService.hasPermission(this.permissions.INVENTORY_WRITE);
  }

  getAvailabilityClass(): string {
    return this.inventory?.available ? 'text-bg-success' : 'text-bg-danger';
  }

  getAvailabilityText(): string {
    return this.inventory?.available ? 'Available' : 'Unavailable';
  }
}
