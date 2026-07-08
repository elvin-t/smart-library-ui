import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InventoryApiService } from '../../services/inventory-api.service';
import { Inventory } from '../../models/inventory.model';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.scss'
})
export class LowStockComponent implements OnInit {

  private readonly inventoryApiService = inject(InventoryApiService);
  private readonly router = inject(Router);

  inventories: Inventory[] = [];

  threshold = 2;
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;

  ngOnInit(): void {
    this.loadLowStock();
  }

  loadLowStock(): void {
    this.isLoading = true;

    this.inventoryApiService.getLowStockBooks(this.threshold, this.page, this.size)
      .subscribe({
        next: response => {
          this.inventories = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  applyThreshold(): void {
    this.page = 0;
    this.loadLowStock();
  }

  viewInventory(bookId: number): void {
    this.router.navigate(['/app/inventory', bookId]);
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadLowStock();
    }
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadLowStock();
    }
  }
}