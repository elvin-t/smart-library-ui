import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PageResponse } from '../../../core/models/page-response.model';

import { BorrowRecord } from '../../borrow/models/borrow-record.model';
import { Fine } from '../models/fine.model';
import { FineStatus } from '../models/fine-status.model';

@Injectable({
  providedIn: 'root'
})
export class FineApiService {

  private readonly borrowBaseUrl =
    `${environment.apiBaseUrl}${API_ENDPOINTS.BORROW.BASE}`;

  constructor(private http: HttpClient) {}

  getFineDetails(borrowRecordId: number): Observable<Fine> {
    return this.http.get<Fine>(
      `${this.borrowBaseUrl}/${borrowRecordId}/fine`
    );
  }

  markFineAsPaid(borrowRecordId: number): Observable<Fine> {
    return this.http.patch<Fine>(
      `${this.borrowBaseUrl}/${borrowRecordId}/fine/pay`,
      {}
    );
  }

  getAllFineRecords(
    fineStatus: FineStatus,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<BorrowRecord>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<BorrowRecord>>(
      this.borrowBaseUrl,
      { params }
    ).pipe(
      map(response => this.filterFineRecords(response, fineStatus))
    );
  }

  getMyFineRecords(
    userId: number,
    fineStatus: FineStatus,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<BorrowRecord>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<BorrowRecord>>(
      `${this.borrowBaseUrl}/user/${userId}`,
      { params }
    ).pipe(
      map(response => this.filterFineRecords(response, fineStatus))
    );
  }

  private filterFineRecords(
    response: PageResponse<BorrowRecord>,
    fineStatus: FineStatus
  ): PageResponse<BorrowRecord> {

    let filteredContent = response.content.filter(record =>
      (record.fineAmount ?? 0) > 0
    );

    if (fineStatus === FineStatus.PENDING) {
      filteredContent = filteredContent.filter(record => !record.finePaid);
    }

    if (fineStatus === FineStatus.PAID) {
      filteredContent = filteredContent.filter(record => record.finePaid);
    }

    return {
      ...response,
      content: filteredContent,
      totalElements: filteredContent.length,
      totalPages: filteredContent.length === 0 ? 0 : 1,
      empty: filteredContent.length === 0
    };
  }
}