import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  setItem(key: string, value: string): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      this.document.defaultView?.sessionStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable in private mode or restricted browser settings.
    }
  }

  getItem(key: string): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      return this.document.defaultView?.sessionStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      this.document.defaultView?.sessionStorage.removeItem(key);
    } catch {
      // Ignore storage remove errors.
    }
  }

  clear(): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      this.document.defaultView?.sessionStorage.clear();
    } catch {
      // Ignore storage clear errors.
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

