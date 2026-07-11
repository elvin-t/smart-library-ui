import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type ConfirmDialogVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
}

export interface ConfirmDialogRequest extends ConfirmDialogOptions {
  resolve: (confirmed: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  private readonly confirmRequestSubject = new Subject<ConfirmDialogRequest>();

  confirmRequest$: Observable<ConfirmDialogRequest> =
    this.confirmRequestSubject.asObservable();

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.confirmRequestSubject.next({
        title: options.title ?? 'Confirm Action',
        message: options.message,
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        variant: options.variant ?? 'primary',
        resolve
      });
    });
  }
}
