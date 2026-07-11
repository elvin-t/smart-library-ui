import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { BookApiService } from '../../services/book-api.service';
import { Book } from '../../models/book.model';
import { BOOK_GENRES, BookGenre } from '../../models/book-genre.model';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {

  books: Book[] = [];
  genres = BOOK_GENRES;
  permissions = PERMISSIONS;

  keyword = '';
  selectedGenre = '';
  isLoading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private bookApiService: BookApiService,
    private permissionService: PermissionService,
    private toastr: ToastrService,
  ){

  }

  ngOnInit(): void {
    this.loadBooks();
  }

  hasPermission(permission: string): boolean{
    return this.permissionService.hasPermission(permission);
  }

  loadBooks(): void {
    this.isLoading = true;

    this.bookApiService.getBooks(this.page, this.size)
      .subscribe({
        next: response => {
          this.books = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  search(): void {
    this.page = 0;

    if (!this.keyword.trim()) {
      this.loadBooks();
      return;
    }

    this.isLoading = true;

    this.bookApiService.searchBooks(this.keyword.trim(), this.page, this.size)
      .subscribe({
        next: response => {
          this.books = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  filterByGenre(): void {
    this.page = 0;

    if (!this.selectedGenre) {
      this.loadBooks();
      return;
    }

    this.isLoading = true;

    this.bookApiService.getBooksByGenre(this.selectedGenre as BookGenre, this.page, this.size)
      .subscribe({
        next: response => {
          this.books = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  clearFilters(): void {
    this.keyword = '';
    this.selectedGenre = '';
    this.page = 0;
    this.loadBooks();
  }

  async deleteBook(book: Book): Promise<void> {
  const confirmed = await this.confirmDialogService.confirm({
    title: 'Delete Book',
    message: `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger'
  });

  if (!confirmed) {
    return;
  }

  this.bookApiService.deleteBook(book.id)
    .subscribe({
      next: () => {
        this.toastr.success('Book deleted successfully');
        this.loadBooks();
      }
    });
}

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadBooks();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadBooks();
    }
  }

  getAvailabilityClass(book: Book): string {
    return book.available ? 'text-bg-success' : 'text-bg-danger';
  }

  getAvailabilityText(book: Book): string {
    return book.available ? 'Available' : 'Unavailable';
  }
}
