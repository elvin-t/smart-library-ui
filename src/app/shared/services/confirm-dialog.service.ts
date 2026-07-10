import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  confirm(message: string): boolean {
    return window.confirm(message);
  }
}
