import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  styleUrl: './book-create.component.scss'
})
export class BookCreateComponent implements OnInit{

  bookForm!: FormGroup;
    constructor(
    private formBuilder: FormBuilder,
    private bookApiService: BookApiService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  genres = BOOK_GENRES;
  isSaving = false;

  ngOnInit(): void {
    this.bookForm = this.formBuilder.group({
    isbn: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    author: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    genre: ['', [Validators.required]],
    totalCopies: [1, [Validators.required, Validators.min(1)]],
    availableCopies: [1, [Validators.required, Validators.min(0)]],
    publicationDate: ['']
  });
  }



  save(): void {
    if (this.bookForm.invalid) {
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

    this.isSaving = true;

    this.bookApiService.createBook(request)
      .subscribe({
        next: response => {
          this.toastr.success('Book created successfully');
          this.router.navigate(['/app/books', response.id]);
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }
}