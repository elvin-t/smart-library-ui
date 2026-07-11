import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardSummary } from '../models/dashboard-summary.model';
import { DashboardApiService } from './dashboard-api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly dashboardApiService = inject(DashboardApiService);

  loadDashboardSummary(): Observable<DashboardSummary> {
    return this.dashboardApiService.getSummary();
  }
}
