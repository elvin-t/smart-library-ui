import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { BookApiService } from '../../services/book-api.service';
import { Book } from '../../models/book.model';
import { PermissionService } from '../../../../core/services/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookApiService = inject(BookApiService);

  public readonly permissionService = inject(PermissionService);
  public readonly permissions = PERMISSIONS;

  readonly bookId = signal<number | null>(null);
  readonly book = signal<Book | null>(null);
  readonly isLoading = signal(false);

  readonly canBorrowBook = computed(() => {
    const book = this.book();

    return !!book &&
      this.permissionService.hasPermission(this.permissions.BORROW_WRITE) &&
      (book.availableCopies ?? 0) > 0 &&
      book.available;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.bookId.set(id);
    this.loadBook();
  }

  loadBook(): void {
    const id = this.bookId();

    if (!id) {
      this.book.set(null);
      return;
    }

    this.isLoading.set(true);

    this.bookApiService.getBookById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.book.set(response);
        },
        error: () => {
          this.book.set(null);
        }
      });
  }

  borrowThisBook(): void {
    const book = this.book();

    if (!book || !this.canBorrowBook()) {
      return;
    }

    this.router.navigate(['/app/borrow-records/create'], {
      queryParams: {
        bookId: book.id
      }
    });
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
