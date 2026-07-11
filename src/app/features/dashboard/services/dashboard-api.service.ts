import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { DashboardSummary } from '../models/dashboard-summary.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {

  private readonly summaryUrl =
    `${environment.apiBaseUrl}${API_ENDPOINTS.DASHBOARD.SUMMARY}`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.summaryUrl);
  }
}
