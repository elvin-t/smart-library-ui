import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  ConfirmDialogRequest,
  ConfirmDialogService,
  ConfirmDialogVariant
} from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {

  private readonly confirmDialogService = inject(ConfirmDialogService);
  private subscription?: Subscription;

  isVisible = false;
  request?: ConfirmDialogRequest;

  ngOnInit(): void {
    this.subscription = this.confirmDialogService.confirmRequest$
      .subscribe(request => {
        this.request = request;
        this.isVisible = true;
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  confirm(): void {
    this.request?.resolve(true);
    this.close();
  }

  cancel(): void {
    this.request?.resolve(false);
    this.close();
  }

  close(): void {
    this.isVisible = false;
    this.request = undefined;
  }

  get confirmButtonClass(): string {
    const variant: ConfirmDialogVariant = this.request?.variant ?? 'primary';

    switch (variant) {
      case 'success':
        return 'btn-success';

      case 'warning':
        return 'btn-warning';

      case 'danger':
        return 'btn-danger';

      default:
        return 'btn-primary';
    }
  }

  get iconClass(): string {
    const variant: ConfirmDialogVariant = this.request?.variant ?? 'primary';

    switch (variant) {
      case 'success':
        return 'bi bi-check-circle';

      case 'warning':
        return 'bi bi-exclamation-triangle';

      case 'danger':
        return 'bi bi-trash';

      default:
        return 'bi bi-question-circle';
    }
  }

  get iconWrapperClass(): string {
    const variant: ConfirmDialogVariant = this.request?.variant ?? 'primary';

    switch (variant) {
      case 'success':
        return 'icon-success';

      case 'warning':
        return 'icon-warning';

      case 'danger':
        return 'icon-danger';

      default:
        return 'icon-primary';
    }
  }
}
