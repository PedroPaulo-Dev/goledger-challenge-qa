export interface Book {
  '@assetType'?: string;
  title: string;
  author: string;
  genres?: string[];
  bookType?: number;
  published?: string;
  currentTenant?: Person;
}

export interface Person {
  '@assetType'?: string;
  id: string;
  name: string;
  dateOfBirth?: string;
  height?: number;
}

export interface Library {
  '@assetType'?: string;
  name: string;
  books?: Book[];
}

export type Page = 'login' | 'register' | 'books' | 'persons' | 'libraries';

export const BOOK_TYPE_LABELS: Record<number, string> = {
  0: 'Hardcover',
  1: 'Paperback',
  2: 'Ebook',
};
