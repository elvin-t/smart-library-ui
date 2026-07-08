import { BookGenre } from './book-genre.model';

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  description?: string;
  genre: BookGenre;
  genreDisplayName?: string;
  totalCopies: number;
  availableCopies: number;
  available: boolean;
  publicationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
