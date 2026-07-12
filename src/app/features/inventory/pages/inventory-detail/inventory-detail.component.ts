import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
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
  styleUrl: './inventory-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly inventoryApiService = inject(InventoryApiService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  readonly bookId = signal<number | null>(null);
  readonly inventory = signal<Inventory | null>(null);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly addCopiesForm = this.formBuilder.group({
    copies: [1, [Validators.required, Validators.min(1)]]
  });

  readonly removeCopiesForm = this.formBuilder.group({
    copies: [1, [Validators.required, Validators.min(1)]]
  });

  readonly adjustAvailableForm = this.formBuilder.group({
    availableCopies: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('bookId'));

    this.bookId.set(id);

    this.loadInventory();
  }

  loadInventory(): void {
    const bookId = this.bookId();

    if (!bookId) {
      this.inventory.set(null);
      return;
    }

    this.isLoading.set(true);

    this.inventoryApiService.getInventoryByBookId(bookId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.inventory.set(response);

          this.adjustAvailableForm.patchValue({
            availableCopies: response.availableCopies
          });
        },
        error: () => {
          this.inventory.set(null);
        }
      });
  }

  addCopies(): void {
    const bookId = this.bookId();

    if (!bookId) {
      return;
    }

    if (this.addCopiesForm.invalid) {
      this.addCopiesForm.markAllAsTouched();
      return;
    }

    const copies = Number(this.addCopiesForm.value.copies);

    this.isSaving.set(true);

    this.inventoryApiService.addCopies(bookId, { copies })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.inventory.set(response);

          this.addCopiesForm.patchValue({
            copies: 1
          });

          this.toastr.success('Copies added successfully');
        }
      });
  }

  async removeCopies(): Promise<void> {
    const bookId = this.bookId();

    if (!bookId) {
      return;
    }

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

    this.isSaving.set(true);

    this.inventoryApiService.removeCopies(bookId, { copies })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.inventory.set(response);

          this.removeCopiesForm.patchValue({
            copies: 1
          });

          this.toastr.success('Copies removed successfully');
        }
      });
  }

  adjustAvailableCopies(): void {
    const bookId = this.bookId();

    if (!bookId) {
      return;
    }

    if (this.adjustAvailableForm.invalid) {
      this.adjustAvailableForm.markAllAsTouched();
      return;
    }

    const availableCopies = Number(
      this.adjustAvailableForm.value.availableCopies
    );

    this.isSaving.set(true);

    this.inventoryApiService.adjustAvailableCopies(bookId, { availableCopies })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.inventory.set(response);
          this.toastr.success('Available copies updated successfully');
        }
      });
  }

  canWriteInventory(): boolean {
    return this.permissionService.hasPermission(this.permissions.INVENTORY_WRITE);
  }

  getAvailabilityClass(): string {
    return this.inventory()?.available ? 'text-bg-success' : 'text-bg-danger';
  }

  getAvailabilityText(): string {
    return this.inventory()?.available ? 'Available' : 'Unavailable';
  }
}
