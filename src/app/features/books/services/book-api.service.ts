import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PageResponse } from '../../../core/models/page-response.model';

import { Book } from '../models/book.model';
import { BookGenre } from '../models/book-genre.model';
import { CreateBookRequest } from '../models/create-book-request.model';
import { UpdateBookRequest } from '../models/update-book-request.model';

@Injectable({
  providedIn: 'root'
})
export class BookApiService {

  private readonly baseUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.BOOKS.BASE}`;

  constructor(private http: HttpClient) {}

  getBooks(page = 0, size = 10, sort = 'createdAt,desc'): Observable<PageResponse<Book>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<PageResponse<Book>>(this.baseUrl, { params });
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }

  getBookByIsbn(isbn: string): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/isbn/${isbn}`);
  }

  searchBooks(keyword: string, page = 0, size = 10): Observable<PageResponse<Book>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Book>>(`${this.baseUrl}/search`, { params });
  }

  getBooksByGenre(genre: BookGenre, page = 0, size = 10): Observable<PageResponse<Book>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Book>>(`${this.baseUrl}/genre/${genre}`, { params });
  }

  getAvailableBooks(page = 0, size = 10): Observable<PageResponse<Book>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Book>>(`${this.baseUrl}/available`, { params });
  }

  createBook(request: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(this.baseUrl, request);
  }

  updateBook(id: number, request: UpdateBookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/${id}`, request);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}