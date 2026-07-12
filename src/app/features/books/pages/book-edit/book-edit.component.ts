import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { BookApiService } from '../../services/book-api.service';
import { BOOK_GENRES } from '../../models/book-genre.model';
import { UpdateBookRequest } from '../../models/update-book-request.model';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './book-edit.component.html',
  styleUrl: './book-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookEditComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookApiService = inject(BookApiService);
  private readonly toastr = inject(ToastrService);

  readonly bookId = signal<number | null>(null);
  readonly book = signal<Book | null>(null);

  readonly genres = BOOK_GENRES;

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly bookForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    author: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    genre: ['', [Validators.required]],
    totalCopies: [1, [Validators.required, Validators.min(1)]],
    availableCopies: [0, [Validators.required, Validators.min(0)]],
    publicationDate: ['']
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
        next: book => {
          this.book.set(book);

          this.bookForm.patchValue({
            title: book.title,
            author: book.author,
            description: book.description ?? '',
            genre: book.genre,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            publicationDate: book.publicationDate ?? ''
          });
        },
        error: () => {
          this.book.set(null);
        }
      });
  }

  update(): void {
    const id = this.bookId();

    if (!id) {
      return;
    }

    if (this.bookForm.invalid || this.isSaving()) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const value = this.bookForm.value;

    const request: UpdateBookRequest = {
      title: value.title ?? '',
      author: value.author ?? '',
      description: value.description ?? '',
      genre: value.genre as any,
      totalCopies: Number(value.totalCopies),
      availableCopies: Number(value.availableCopies),
      publicationDate: value.publicationDate || undefined
    };

    this.isSaving.set(true);

    this.bookApiService.updateBook(id, request)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.toastr.success('Book updated successfully');
          this.router.navigate(['/app/books', response.id]);
        }
      });
  }
}
