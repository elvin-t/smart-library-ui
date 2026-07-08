import { BookGenre } from './book-genre.model';

export interface CreateBookRequest {
  isbn: string;
  title: string;
  author: string;
  description?: string;
  genre: BookGenre;
  totalCopies: number;
  availableCopies?: number;
  publicationDate?: string;
}