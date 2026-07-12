import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
  styleUrl: './book-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookListComponent implements OnInit {

  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly bookApiService = inject(BookApiService);
  private readonly permissionService = inject(PermissionService);
  private readonly toastr = inject(ToastrService);

  readonly books = signal<Book[]>([]);
  readonly genres = BOOK_GENRES;
  readonly permissions = PERMISSIONS;

  readonly keyword = signal('');
  readonly selectedGenre = signal('');
  readonly isLoading = signal(false);

  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.loadBooks();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  loadBooks(): void {
    this.isLoading.set(true);

    this.bookApiService.getBooks(this.page(), this.size())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.books.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.books.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
        }
      });
  }

  search(): void {
    this.page.set(0);

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
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.books.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
        }
      });
  }

  filterByGenre(): void {
    this.page.set(0);

    const genre = this.selectedGenre();

    if (!genre) {
      this.loadBooks();
      return;
    }

    this.isLoading.set(true);

    this.bookApiService.getBooksByGenre(
      genre as BookGenre,
      this.page(),
      this.size()
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.books.set(response?.content ?? []);
          this.totalPages.set(response?.totalPages ?? 0);
          this.totalElements.set(response?.totalElements ?? 0);
        },
        error: () => {
          this.books.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
        }
      });
  }

  clearFilters(): void {
    this.keyword.set('');
    this.selectedGenre.set('');
    this.page.set(0);
    this.loadBooks();
  }

  onKeywordChange(value: string): void {
    this.keyword.set(value);
  }

  onGenreChange(value: string): void {
    this.selectedGenre.set(value);
    this.filterByGenre();
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
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadBooks();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
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
