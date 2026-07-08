import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  styleUrl: './book-edit.component.scss'
})
export class BookEditComponent implements OnInit {

  bookId!: number;
  book?: Book;
  genres = BOOK_GENRES;
  isLoading = false;
  isSaving = false;

  bookForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    author: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    genre: ['', [Validators.required]],
    totalCopies: [1, [Validators.required, Validators.min(1)]],
    availableCopies: [0, [Validators.required, Validators.min(0)]],
    publicationDate: ['']
  });

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookApiService: BookApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.bookId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBook();
  }

  loadBook(): void {
    this.isLoading = true;

    this.bookApiService.getBookById(this.bookId)
      .subscribe({
        next: book => {
          this.book = book;

          this.bookForm.patchValue({
            title: book.title,
            author: book.author,
            description: book.description ?? '',
            genre: book.genre,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            publicationDate: book.publicationDate ?? ''
          });

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  update(): void {
    if (this.bookForm.invalid) {
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

    this.isSaving = true;

    this.bookApiService.updateBook(this.bookId, request)
      .subscribe({
        next: response => {
          this.toastr.success('Book updated successfully');
          this.router.navigate(['/app/books', response.id]);
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }
}