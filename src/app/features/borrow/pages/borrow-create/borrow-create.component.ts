import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { BorrowApiService } from '../../services/borrow-api.service';
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
export class BorrowCreateComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly borrowApiService = inject(BorrowApiService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  isSaving = false;

  borrowForm = this.formBuilder.group({
    userId: [this.authService.getUserId(), [Validators.required, Validators.min(1)]],
    bookId: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  borrowBook(): void {
    if (this.borrowForm.invalid) {
      this.borrowForm.markAllAsTouched();
      return;
    }

    const request = {
      userId: Number(this.borrowForm.value.userId),
      bookId: Number(this.borrowForm.value.bookId)
    };

    this.isSaving = true;

    this.borrowApiService.borrowBook(request)
      .subscribe({
        next: response => {
          this.toastr.success('Book borrowed successfully');
          this.router.navigate(['/app/borrow-records', response.id]);
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }
}