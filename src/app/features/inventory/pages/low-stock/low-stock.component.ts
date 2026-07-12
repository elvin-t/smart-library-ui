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
  styleUrl: './low-stock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LowStockComponent implements OnInit {

  private readonly inventoryApiService = inject(InventoryApiService);
  private readonly router = inject(Router);

  readonly inventories = signal<Inventory[]>([]);

  readonly threshold = signal(2);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadLowStock();
  }

  loadLowStock(): void {
    this.isLoading.set(true);

    this.inventoryApiService.getLowStockBooks(
      this.threshold(),
      this.page(),
      this.size()
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.inventories.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.inventories.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
        }
      });
  }

  applyThreshold(): void {
    this.page.set(0);
    this.loadLowStock();
  }

  onThresholdChange(value: number | string): void {
    const thresholdValue = Number(value);

    this.threshold.set(
      Number.isNaN(thresholdValue) || thresholdValue < 0
        ? 0
        : thresholdValue
    );
  }

  viewInventory(bookId: number): void {
    this.router.navigate(['/app/inventory', bookId]);
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      this.loadLowStock();
    }
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadLowStock();
    }
  }
}
