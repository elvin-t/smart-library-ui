import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
  styleUrl: './book-detail.component.scss'
})
export class BookDetailComponent implements OnInit {

  book?: Book;
  isLoading = false;
  permissions = PERMISSIONS;

  constructor(
    private route: ActivatedRoute,
    private bookApiService: BookApiService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBook(id);
  }

  loadBook(id: number): void {
    this.isLoading = true;

    this.bookApiService.getBookById(id)
      .subscribe({
        next: response => {
          this.book = response;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
}