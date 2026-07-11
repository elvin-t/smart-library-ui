import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { TokenService } from '../../../core/services/token.service';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { AuthApiService } from './auth-api.service';
import { RegisterRequest } from '../models/register-request.model';



@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private readonly authApiService = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);



  login(request: LoginRequest): Observable<AuthResponse> {
    return this.authApiService.login(request).pipe(
      tap((response: AuthResponse) => {
        this.tokenService.saveToken(response.token);
      })
    );
  }

  register(request: RegisterRequest): Observable<string> {
  return this.authApiService.register(request);
}

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate([APP_ROUTES.LOGIN]);
  }

  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }

  getUserId(): number | null {
    return this.tokenService.getUserId();
  }

  getEmail(): string | null {
    return this.tokenService.getEmail();
  }

  getRoles(): string[] {
    return this.tokenService.getRoles();
  }

  getPermissions(): string[] {
    return this.tokenService.getPermissions();
  }
}
