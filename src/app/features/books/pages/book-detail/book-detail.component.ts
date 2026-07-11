import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
    private router: Router,
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

  canBorrowBook(): boolean {
    return !!this.book &&
      this.permissionService.hasPermission(this.permissions.BORROW_WRITE) &&
      (this.book.availableCopies ?? 0) > 0 &&
      this.book.available;
  }

  borrowThisBook(): void {
    if (!this.book || !this.canBorrowBook()) {
      return;
    }

    this.router.navigate(['/app/borrow-records/create'], {
      queryParams: {
        bookId: this.book.id
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
