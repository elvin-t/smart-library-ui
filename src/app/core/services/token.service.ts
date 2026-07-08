import { Injectable } from '@angular/core';
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

  private readonly TOKEN_KEY = 'smart_library_token';

  constructor(private storageService: StorageService) {}

  saveToken(token: string): void {
    this.storageService.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.storageService.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
  }

  decodeToken(): JwtPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  getEmail(): string | null {
    const payload = this.decodeToken();
    return payload?.sub ?? null;
  }

  getUserId(): number | null {
    const payload = this.decodeToken();
    return payload?.userId ?? null;
  }

  getRoles(): string[] {
    const payload = this.decodeToken();
    return payload?.roles ?? [];
  }

  getPermissions(): string[] {
    const payload = this.decodeToken();
    return payload?.permissions ?? [];
  }

  isTokenExpired(): boolean {
    const payload = this.decodeToken();

    if (!payload?.exp) {
      return true;
    }

    const expiryTime = payload.exp * 1000;
    return Date.now() >= expiryTime;
  }

  isTokenValid(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }
}
