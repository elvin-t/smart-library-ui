import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent implements OnInit {

  private readonly bookApiService = inject(BookApiService);
  private readonly router = inject(Router);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  books: Book[] = [];

  keyword = '';
  isLoading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;

    this.bookApiService.getBooks(this.page, this.size)
      .subscribe({
        next: response => {
          this.books = response?.content ?? [];
          this.totalPages = response?.totalPages ?? 0;
          this.totalElements = response?.totalElements ?? this.books.length;
          this.isLoading = false;
        },
        error: () => {
          this.books = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.isLoading = false;
        }
      });
  }

  searchBooks(): void {
    this.page = 0;

    const searchText = this.keyword.trim();

    if (!searchText) {
      this.loadBooks();
      return;
    }

    this.isLoading = true;

    this.bookApiService.searchBooks(searchText, this.page, this.size)
      .subscribe({
        next: response => {
          this.books = response?.content ?? [];
          this.totalPages = response?.totalPages ?? 0;
          this.totalElements = response?.totalElements ?? this.books.length;
          this.isLoading = false;
        },
        error: () => {
          this.books = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.isLoading = false;
        }
      });
  }

  clearSearch(): void {
    this.keyword = '';
    this.page = 0;
    this.loadBooks();
  }

  manageInventory(book: Book): void {
    this.router.navigate(['/app/inventory', book.id]);
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;

      if (this.keyword.trim()) {
        this.searchBooks();
      } else {
        this.loadBooks();
      }
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;

      if (this.keyword.trim()) {
        this.searchBooks();
      } else {
        this.loadBooks();
      }
    }
  }

  canManageInventory(): boolean {
    return this.permissionService.hasPermission(this.permissions.INVENTORY_WRITE);
  }

  getBorrowedCopies(book: Book): number {
    return Math.max((book.totalCopies ?? 0) - (book.availableCopies ?? 0), 0);
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
