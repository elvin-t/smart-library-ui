import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  styleUrl: './borrow-create.component.scss'
})
export class BorrowCreateComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly borrowApiService = inject(BorrowApiService);
  private readonly bookApiService = inject(BookApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  public readonly permissionService = inject(PermissionService);

  availableBooks: Book[] = [];

  isLoadingBooks = false;
  isSaving = false;

  borrowForm = this.formBuilder.group({
    userId: [this.authService.getUserId(), [Validators.required, Validators.min(1)]],
    bookId: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.loadAvailableBooks();

    if (this.permissionService.isMember()) {
      this.borrowForm.controls.userId.disable();
    }
  }

  loadAvailableBooks(): void {
  this.isLoadingBooks = true;

  this.bookApiService.getAvailableBooks(0, 100)
    .subscribe({
      next: response => {
        this.availableBooks = (response?.content ?? [])
          .filter(book => book.availableCopies > 0 && book.available);

        this.isLoadingBooks = false;
      },
      error: () => {
        this.availableBooks = [];
        this.isLoadingBooks = false;
      }
    });
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

    this.isSaving = true;

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
          this.isSaving = false;
        }
      });
  }

  get selectedBook(): Book | undefined {
    const bookId = Number(this.borrowForm.getRawValue().bookId);
    return this.availableBooks.find(book => book.id === bookId);
  }

  get backRoute(): string {
    return this.permissionService.isMember()
      ? '/app/my-borrows'
      : '/app/borrow-records';
  }
}
