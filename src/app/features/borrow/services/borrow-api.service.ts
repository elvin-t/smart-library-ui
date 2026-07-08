import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PageResponse } from '../../../core/models/page-response.model';

import { BorrowRequest } from '../models/borrow-request.model';
import { BorrowRecord } from '../models/borrow-record.model';
import { BorrowStatus } from '../models/borrow-status.model';
import { FineResponse } from '../models/fine-response.model';

@Injectable({
  providedIn: 'root'
})
export class BorrowApiService {

  private readonly baseUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.BORROW.BASE}`;

  constructor(private http: HttpClient) {}

  borrowBook(request: BorrowRequest): Observable<BorrowRecord> {
    return this.http.post<BorrowRecord>(this.baseUrl, request);
  }

  returnBook(borrowRecordId: number): Observable<BorrowRecord> {
    return this.http.patch<BorrowRecord>(
      `${this.baseUrl}/${borrowRecordId}/return`,
      {}
    );
  }

  getBorrowRecordById(id: number): Observable<BorrowRecord> {
    return this.http.get<BorrowRecord>(`${this.baseUrl}/${id}`);
  }

  getAllBorrowRecords(
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<BorrowRecord>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<BorrowRecord>>(this.baseUrl, { params });
  }

  getBorrowRecordsByUser(
    userId: number,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<BorrowRecord>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<BorrowRecord>>(
      `${this.baseUrl}/user/${userId}`,
      { params }
    );
  }

  getBorrowRecordsByStatus(
    status: BorrowStatus,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Observable<PageResponse<BorrowRecord>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<BorrowRecord>>(
      `${this.baseUrl}/status/${status}`,
      { params }
    );
  }

  getFineDetails(borrowRecordId: number): Observable<FineResponse> {
    return this.http.get<FineResponse>(
      `${this.baseUrl}/${borrowRecordId}/fine`
    );
  }

  markFineAsPaid(borrowRecordId: number): Observable<FineResponse> {
    return this.http.patch<FineResponse>(
      `${this.baseUrl}/${borrowRecordId}/fine/pay`,
      {}
    );
  }
}