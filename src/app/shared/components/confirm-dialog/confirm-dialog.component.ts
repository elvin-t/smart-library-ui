import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
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
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {

  private readonly confirmDialogService = inject(ConfirmDialogService);
  private subscription?: Subscription;

  readonly isVisible = signal(false);
  readonly request = signal<ConfirmDialogRequest | null>(null);

  readonly confirmButtonClass = computed(() => {
    const variant: ConfirmDialogVariant =
      this.request()?.variant ?? 'primary';

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
  });

  readonly iconClass = computed(() => {
    const variant: ConfirmDialogVariant =
      this.request()?.variant ?? 'primary';

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
  });

  readonly iconWrapperClass = computed(() => {
    const variant: ConfirmDialogVariant =
      this.request()?.variant ?? 'primary';

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
  });

  ngOnInit(): void {
    this.subscription = this.confirmDialogService.confirmRequest$
      .subscribe(request => {
        this.request.set(request);
        this.isVisible.set(true);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  confirm(): void {
    this.request()?.resolve(true);
    this.close();
  }

  cancel(): void {
    this.request()?.resolve(false);
    this.close();
  }

  close(): void {
    this.isVisible.set(false);
    this.request.set(null);
  }
}
