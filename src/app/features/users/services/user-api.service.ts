import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PageResponse } from '../../../core/models/page-response.model';

import { User } from '../models/user.model';
import { UpdateUserRequest } from '../models/update-user-request.model';
import { UpdateUserStatusRequest } from '../models/update-user-status-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  private readonly baseUrl =
    `${environment.apiBaseUrl}${API_ENDPOINTS.USERS.BASE}`;

  constructor(private http: HttpClient) {}

  getUsers(
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<User>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<User>>(this.baseUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, request);
  }

  updateUserStatus(
    id: number,
    request: UpdateUserStatusRequest
  ): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/status`, request);
  }
}