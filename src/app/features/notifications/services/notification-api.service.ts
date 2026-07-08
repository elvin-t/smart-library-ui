import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PageResponse } from '../../../core/models/page-response.model';

import { Notification } from '../models/notification.model';
import { NotificationType } from '../models/notification-type.model';
import { NotificationStatus } from '../models/notification-status.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {

  private readonly baseUrl =
    `${environment.apiBaseUrl}${API_ENDPOINTS.NOTIFICATIONS.BASE}`;

  constructor(private http: HttpClient) {}

  getAllNotifications(
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<Notification>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<Notification>>(this.baseUrl, { params });
  }

  getNotificationsByUser(
    userId: number,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<Notification>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<Notification>>(
      `${this.baseUrl}/user/${userId}`,
      { params }
    );
  }

  getNotificationsByType(
    type: NotificationType,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<Notification>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<Notification>>(
      `${this.baseUrl}/type/${type}`,
      { params }
    );
  }

  getNotificationsByStatus(
    status: NotificationStatus,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<Notification>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<Notification>>(
      `${this.baseUrl}/status/${status}`,
      { params }
    );
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.baseUrl}/${id}`);
  }
}
