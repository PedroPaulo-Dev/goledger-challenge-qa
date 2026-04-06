import type { Book, Person, Library } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// ── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'qa_api_token';

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isTokenPresent(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Login failed');
  return body as LoginResponse;
}

export async function register(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Registration failed');
}

export async function getProfile(): Promise<Person> {
  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Failed to load profile');
  return body as Person;
}

// ── Books ─────────────────────────────────────────────────────────────────────

export interface GetBooksParams {
  author: string;
  genre: string;
  page: number;
  limit: number;
}

export async function getBooks(params: GetBooksParams): Promise<Book[]> {
  const query = new URLSearchParams({
    author: params.author,
    page:   String(params.page),
    limit:  String(params.limit),
  });

  if (params.genre) {
    query.set('genre', params.genre);
  }

  const res = await fetch(`${API_BASE}/books?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Failed to fetch books');
  return body as Book[];
}

export interface CreateBookData {
  title: string;
  author: string;
  genres?: string[];
  bookType?: number;
  published?: string;
}

export async function createBook(data: CreateBookData): Promise<Book> {
  const res = await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Failed to create book');
  return body as Book;
}

export async function deleteBook(title: string, author: string): Promise<void> {
  const query = new URLSearchParams({ title, author });
  const res = await fetch(`${API_BASE}/books?${query}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to delete book');
  }
}

export interface UpdateTenantData {
  title: string;
  author: string;
  tenantId: string;
}

export async function updateBookTenant(data: UpdateTenantData): Promise<Book> {
  const res = await fetch(`${API_BASE}/books/tenant`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Failed to update tenant');
  return body as Book;
}

// ── Persons ───────────────────────────────────────────────────────────────────

export interface CreatePersonData {
  id: string;
  name: string;
  dateOfBirth?: string;
  height?: number;
}

export async function createPerson(data: CreatePersonData): Promise<Person> {
  const res = await fetch(`${API_BASE}/persons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (res.status !== 200) throw new Error(body.error ?? 'Failed to create person');
  return body as Person;
}

// ── Libraries ─────────────────────────────────────────────────────────────────

export async function createLibrary(name: string): Promise<Library> {
  const res = await fetch(`${API_BASE}/libraries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Failed to create library');
  return body as Library;
}

export async function getLibraryBookCount(name: string): Promise<{ numberOfBooks: number }> {
  const res = await fetch(`${API_BASE}/libraries/${encodeURIComponent(name)}/books`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Failed to get book count');
  return body as { numberOfBooks: number };
}
