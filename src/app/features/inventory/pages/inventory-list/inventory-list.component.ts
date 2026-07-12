import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { BookApiService } from '../../../books/services/book-api.service';
import { Book } from '../../../books/models/book.model';

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
  styleUrl: './inventory-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryListComponent implements OnInit {

  private readonly bookApiService = inject(BookApiService);
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);

  readonly permissions = PERMISSIONS;

  readonly books = signal<Book[]>([]);

  readonly keyword = signal('');
  readonly isLoading = signal(false);

  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading.set(true);

    this.bookApiService.getBooks(this.page(), this.size())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.books.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? this.books().length);
        },
        error: () => {
          this.resetData();
        }
      });
  }

  searchBooks(resetPage = true): void {
    if (resetPage) {
      this.page.set(0);
    }

    const searchText = this.keyword().trim();

    if (!searchText) {
      this.loadBooks();
      return;
    }

    this.isLoading.set(true);

    this.bookApiService.searchBooks(searchText, this.page(), this.size())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.books.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? this.books().length);
        },
        error: () => {
          this.resetData();
        }
      });
  }

  clearSearch(): void {
    this.keyword.set('');
    this.page.set(0);
    this.loadBooks();
  }

  onKeywordChange(value: string): void {
    this.keyword.set(value);
  }

  manageInventory(book: Book): void {
    this.router.navigate(['/app/inventory', book.id]);
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadCurrentPage();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      this.loadCurrentPage();
    }
  }

  private loadCurrentPage(): void {
    if (this.keyword().trim()) {
      this.searchBooks(false);
      return;
    }

    this.loadBooks();
  }

  private resetData(): void {
    this.books.set([]);
    this.totalPages.set(0);
    this.totalElements.set(0);
  }

  canManageInventory(): boolean {
    return this.permissionService.hasPermission(this.permissions.INVENTORY_WRITE);
  }

  getBorrowedCopies(book: Book): number {
    return Math.max(
      (book.totalCopies ?? 0) - (book.availableCopies ?? 0),
      0
    );
  }

  getAvailabilityClass(book: Book): string {
    if ((book.availableCopies ?? 0) <= 0) {
      return 'text-bg-danger';
    }

    if ((book.availableCopies ?? 0) <= 2) {
      return 'text-bg-warning';
    }

    return 'text-bg-success';
  }

  getAvailabilityText(book: Book): string {
    if ((book.availableCopies ?? 0) <= 0) {
      return 'Out of Stock';
    }

    if ((book.availableCopies ?? 0) <= 2) {
      return 'Low Stock';
    }

    return 'Available';
  }
}
