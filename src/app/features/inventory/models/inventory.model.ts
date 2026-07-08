export interface Inventory {
  bookId: number;
  isbn: string;
  title: string;
  author: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  available: boolean;
}