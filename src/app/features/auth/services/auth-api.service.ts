import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { RegisterRequest } from '../models/register-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      request
    );
  }


  register(request: RegisterRequest): Observable<string> {
    return this.http.post(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
      request,
      {
        responseType: 'text'
      }
    );
  }

}
