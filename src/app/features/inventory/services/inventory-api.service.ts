import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PageResponse } from '../../../core/models/page-response.model';

import { Inventory } from '../models/inventory.model';
import { AddCopiesRequest } from '../models/add-copies-request.model';
import { RemoveCopiesRequest } from '../models/remove-copies-request.model';
import { AdjustAvailableCopiesRequest } from '../models/adjust-available-copies-request.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryApiService {

  private readonly baseUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.INVENTORY.BASE}`;

  constructor(private http: HttpClient) {}

  getInventoryByBookId(bookId: number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.baseUrl}/${bookId}`);
  }

  addCopies(bookId: number, request: AddCopiesRequest): Observable<Inventory> {
    return this.http.patch<Inventory>(
      `${this.baseUrl}/${bookId}/add-copies`,
      request
    );
  }

  removeCopies(bookId: number, request: RemoveCopiesRequest): Observable<Inventory> {
    return this.http.patch<Inventory>(
      `${this.baseUrl}/${bookId}/remove-copies`,
      request
    );
  }

  adjustAvailableCopies(
    bookId: number,
    request: AdjustAvailableCopiesRequest
  ): Observable<Inventory> {
    return this.http.patch<Inventory>(
      `${this.baseUrl}/${bookId}/available-copies`,
      request
    );
  }

  getUnavailableBooks(page = 0, size = 10): Observable<PageResponse<Inventory>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Inventory>>(
      `${this.baseUrl}/unavailable`,
      { params }
    );
  }

  getLowStockBooks(
    threshold = 2,
    page = 0,
    size = 10
  ): Observable<PageResponse<Inventory>> {
    const params = new HttpParams()
      .set('threshold', threshold)
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Inventory>>(
      `${this.baseUrl}/low-stock`,
      { params }
    );
  }
}