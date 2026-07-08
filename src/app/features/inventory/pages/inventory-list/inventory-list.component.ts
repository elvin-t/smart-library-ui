import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { InventoryApiService } from '../../services/inventory-api.service';
import { Inventory } from '../../models/inventory.model';
import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent {

  private readonly inventoryApiService = inject(InventoryApiService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  bookId?: number;
  inventory?: Inventory;
  isLoading = false;

  searchInventory(): void {
    if (!this.bookId || this.bookId <= 0) {
      this.toastr.warning('Please enter a valid book ID');
      return;
    }

    this.isLoading = true;

    this.inventoryApiService.getInventoryByBookId(this.bookId)
      .subscribe({
        next: response => {
          this.inventory = response;
          this.isLoading = false;
        },
        error: () => {
          this.inventory = undefined;
          this.isLoading = false;
        }
      });
  }

  viewDetails(bookId: number): void {
    this.router.navigate(['/app/inventory', bookId]);
  }

  getAvailabilityClass(inventory: Inventory): string {
    return inventory.available ? 'text-bg-success' : 'text-bg-danger';
  }

  getAvailabilityText(inventory: Inventory): string {
    return inventory.available ? 'Available' : 'Unavailable';
  }
}