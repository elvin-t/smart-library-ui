import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AdminCreateUserRequest } from '../models/admin-create-user-request.model';
import { AdminCreateUserResponse } from '../models/admin-create-user-response.model';
import { AdminUserStatusResponse } from '../models/admin-user-status-response.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUserApiService {

  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth/admin/users`;

  constructor(private http: HttpClient) {}

  createUser(request: AdminCreateUserRequest): Observable<AdminCreateUserResponse> {
    return this.http.post<AdminCreateUserResponse>(this.baseUrl, request);
  }

  activateUser(userId: number): Observable<AdminUserStatusResponse> {
    return this.http.patch<AdminUserStatusResponse>(
      `${this.baseUrl}/${userId}/activate`,
      {}
    );
  }

  deactivateUser(userId: number): Observable<AdminUserStatusResponse> {
    return this.http.patch<AdminUserStatusResponse>(
      `${this.baseUrl}/${userId}/deactivate`,
      {}
    );
  }
}