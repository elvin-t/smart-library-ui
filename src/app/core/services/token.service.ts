import { Injectable, computed, inject, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

import { StorageService } from './storage.service';

interface JwtPayload {
  sub?: string;
  userId?: number;
  roles?: string[];
  permissions?: string[];
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly storageService = inject(StorageService);

  private readonly TOKEN_KEY = 'smart_library_token';

  private readonly tokenSignal = signal<string | null>(
    this.storageService.getItem(this.TOKEN_KEY)
  );

  readonly token = this.tokenSignal.asReadonly();

  readonly decodedToken = computed<JwtPayload | null>(() => {
    const token = this.tokenSignal();

    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  });

  readonly email = computed(() =>
    this.decodedToken()?.sub ?? null
  );

  readonly userId = computed(() =>
    this.decodedToken()?.userId ?? null
  );

  readonly roles = computed(() =>
    this.decodedToken()?.roles ?? []
  );

  readonly permissions = computed(() =>
    this.decodedToken()?.permissions ?? []
  );

  readonly isExpired = computed(() => {
    const exp = this.decodedToken()?.exp;

    if (!exp) {
      return true;
    }

    const expiryTime = exp * 1000;

    return Date.now() >= expiryTime;
  });

  readonly isValid = computed(() =>
    !!this.tokenSignal() && !this.isExpired()
  );

  readonly isAuthenticated = computed(() =>
    this.isValid()
  );

  saveToken(token: string): void {
    this.storageService.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  removeToken(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  decodeToken(): JwtPayload | null {
    return this.decodedToken();
  }

  getEmail(): string | null {
    return this.email();
  }

  getUserId(): number | null {
    return this.userId();
  }

  getRoles(): string[] {
    return this.roles();
  }

  getPermissions(): string[] {
    return this.permissions();
  }

  isTokenExpired(): boolean {
    return this.isExpired();
  }

  isTokenValid(): boolean {
    return this.isValid();
  }
}
