import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
import { PermissionService } from '../../../../core/services/permission.service';

import { BookApiService } from '../../../books/services/book-api.service';
import { Book } from '../../../books/models/book.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-borrow-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './borrow-create.component.html',
  styleUrl: './borrow-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BorrowCreateComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly borrowApiService = inject(BorrowApiService);
  private readonly bookApiService = inject(BookApiService);
  private readonly authService = inject(AuthService);
  private readonly permissionServiceInternal = inject(PermissionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  public readonly permissionService = this.permissionServiceInternal;

  readonly availableBooks = signal<Book[]>([]);

  readonly isLoadingBooks = signal(false);
  readonly isSaving = signal(false);

  readonly requestedBookId = signal<number | null>(null);

  readonly borrowForm = this.formBuilder.group({
    userId: [this.authService.getUserId(), [Validators.required, Validators.min(1)]],
    bookId: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  readonly selectedBookId = toSignal(
    this.borrowForm.controls.bookId.valueChanges,
    {
      initialValue: this.borrowForm.controls.bookId.value
    }
  );

  readonly selectedBook = computed(() => {
    const bookId = Number(this.selectedBookId());

    if (!bookId) {
      return undefined;
    }

    return this.availableBooks().find(book => book.id === bookId);
  });

  readonly backRoute = computed(() =>
    this.permissionService.isMember()
      ? '/app/books'
      : '/app/borrow-records'
  );

  ngOnInit(): void {
    this.readQueryParams();

    if (this.permissionService.isMember()) {
      this.borrowForm.controls.userId.disable();
    }

    this.loadAvailableBooks();
  }

  private readQueryParams(): void {
    const bookId = Number(this.route.snapshot.queryParamMap.get('bookId'));

    if (bookId && bookId > 0) {
      this.requestedBookId.set(bookId);

      this.borrowForm.patchValue({
        bookId
      });
    }
  }

  loadAvailableBooks(): void {
    this.isLoadingBooks.set(true);

    this.bookApiService.getAvailableBooks(0, 100)
      .subscribe({
        next: response => {
          const books = (response?.content ?? [])
            .filter(book =>
              (book.availableCopies ?? 0) > 0 &&
              book.available
            );

          this.availableBooks.set(books);

          this.handleRequestedBookAfterLoad();

          this.isLoadingBooks.set(false);
        },
        error: () => {
          this.availableBooks.set([]);
          this.isLoadingBooks.set(false);
        }
      });
  }

  private handleRequestedBookAfterLoad(): void {
    const requestedBookId = this.requestedBookId();

    if (!requestedBookId) {
      return;
    }

    const bookExists = this.availableBooks().some(
      book => book.id === requestedBookId
    );

    if (!bookExists) {
      this.borrowForm.patchValue({
        bookId: null
      });

      this.toastr.warning(
        'Selected book is currently not available for borrowing.'
      );
    }
  }

  borrowBook(): void {
    if (this.borrowForm.invalid) {
      this.borrowForm.markAllAsTouched();
      return;
    }

    const rawValue = this.borrowForm.getRawValue();

    const request = {
      userId: Number(rawValue.userId),
      bookId: Number(rawValue.bookId)
    };

    this.isSaving.set(true);

    this.borrowApiService.borrowBook(request)
      .subscribe({
        next: response => {
          this.toastr.success('Book borrowed successfully');

          if (this.permissionService.isMember()) {
            this.router.navigate(['/app/my-borrows']);
          } else {
            this.router.navigate(['/app/borrow-records', response.id]);
          }
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
  }
}
