import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { BookApiService } from '../../services/book-api.service';
import { BOOK_GENRES } from '../../models/book-genre.model';
import { CreateBookRequest } from '../../models/create-book-request.model';

@Component({
  selector: 'app-book-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './book-create.component.html',
  styleUrl: './book-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookCreateComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly bookApiService = inject(BookApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly genres = BOOK_GENRES;
  readonly isSaving = signal(false);

  readonly bookForm = this.formBuilder.group({
    isbn: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    author: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    genre: ['', [Validators.required]],
    totalCopies: [1, [Validators.required, Validators.min(1)]],
    availableCopies: [1, [Validators.required, Validators.min(0)]],
    publicationDate: ['']
  });

  save(): void {
    if (this.bookForm.invalid || this.isSaving()) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const value = this.bookForm.value;

    const request: CreateBookRequest = {
      isbn: value.isbn ?? '',
      title: value.title ?? '',
      author: value.author ?? '',
      description: value.description ?? '',
      genre: value.genre as any,
      totalCopies: Number(value.totalCopies),
      availableCopies: Number(value.availableCopies),
      publicationDate: value.publicationDate || undefined
    };

    this.isSaving.set(true);

    this.bookApiService.createBook(request)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: response => {
          this.toastr.success('Book created successfully');
          this.router.navigate(['/app/books', response.id]);
        }
      });
  }
}
