import { useState } from 'react';
import {
  getBooks,
  createBook,
  deleteBook,
  updateBookTenant,
  type GetBooksParams,
  type CreateBookData,
} from '../api';
import type { Book } from '../types';
import { BOOK_TYPE_LABELS } from '../types';

const LIMIT_OPTIONS = [5, 10, 20, 50];

function bookTypeBadge(type?: number) {
  if (type === undefined) return '—';
  const label = BOOK_TYPE_LABELS[type] ?? String(type);
  const cls =
    type === 0 ? 'badge-hardcover' : type === 1 ? 'badge-paperback' : 'badge-ebook';
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function BooksPage() {
  // ── Search state ─────────────────────────────────────────
  const [author, setAuthor]   = useState('');
  const [genre, setGenre]     = useState('');
  const [limit, setLimit]     = useState(10);
  const [page, setPage]       = useState(1);

  // ── Results state ────────────────────────────────────────
  const [books, setBooks]     = useState<Book[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // ── Create form state ────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle]   = useState('');
  const [createAuthor, setCreateAuthor] = useState('');
  const [createGenres, setCreateGenres] = useState('');
  const [createType, setCreateType]     = useState<string>('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError]   = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // ── Update-tenant form state ─────────────────────────────
  const [showTenant, setShowTenant]     = useState(false);
  const [tenantTitle, setTenantTitle]   = useState('');
  const [tenantAuthor, setTenantAuthor] = useState('');
  const [tenantId, setTenantId]         = useState('');
  const [tenantLoading, setTenantLoading] = useState(false);
  const [tenantError, setTenantError]   = useState('');
  const [tenantSuccess, setTenantSuccess] = useState('');

  // ── Search ───────────────────────────────────────────────
  const handleSearch = async (overridePage?: number) => {
    if (!author.trim()) {
      setError("Please enter an author name to search.");
      return;
    }
    setError('');
    setLoading(true);
    const params: GetBooksParams = {
      author: author.trim(),
      genre,
      page: overridePage ?? page,
      limit,
    };
    try {
      const data = await getBooks(params);
      setBooks(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Pagination ────────────────────────────────────────────
  const handleNext = () => {
    const next = page + 1;
    setPage(next);
    handleSearch(next);
  };

  const handlePrev = () => {
    const prev = 1;
    setPage(prev);
    handleSearch(prev);
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (book: Book) => {
    setError('');
    try {
      await deleteBook(book.title, book.author);
      setBooks(prev =>
        prev.filter(b => !(b.title === book.title && b.author === book.author)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book.');
    }
  };

  // ── Create book ───────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreateLoading(true);

    const data: CreateBookData = {
      title: createTitle.trim(),
      author: createAuthor.trim(),
    };
    if (createGenres.trim()) {
      data.genres = createGenres.split(',').map(g => g.trim()).filter(Boolean);
    }
    if (createType !== '') {
      data.bookType = Number(createType);
    }

    try {
      await createBook(data);
      setCreateSuccess(`Book "${data.title}" created successfully!`);
      setCreateTitle('');
      setCreateAuthor('');
      setCreateGenres('');
      setCreateType('');
    } catch (_err) {
      setCreateError('An error occurred. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Update tenant ─────────────────────────────────────────
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError('');
    setTenantSuccess('');
    setTenantLoading(true);
    try {
      await updateBookTenant({
        title: tenantTitle.trim(),
        author: tenantAuthor.trim(),
        tenantId: tenantId.trim(),
      });
      setTenantSuccess('Tenant updated successfully!');
    } catch (err) {
      setTenantError(err instanceof Error ? err.message : 'Failed to update tenant.');
    } finally {
      setTenantLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Books</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setShowTenant(v => !v); setShowCreate(false); }}
          >
            {showTenant ? 'Hide' : 'Assign Tenant'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setShowCreate(v => !v); setShowTenant(false); }}
          >
            {showCreate ? 'Cancel' : '+ New Book'}
          </button>
        </div>
      </div>

      {/* ── Create book form ─────────────────────────────── */}
      {showCreate && (
        <div className="card">
          <h2 className="card-title">Create New Book</h2>
          {createError   && <div className="alert alert-error">{createError}</div>}
          {createSuccess && <div className="alert alert-success">{createSuccess}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="c-title">Title *</label>
                <input
                  id="c-title"
                  type="text"
                  value={createTitle}
                  onChange={e => setCreateTitle(e.target.value)}
                  placeholder="e.g. The Go Programming Language"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="c-author">Author *</label>
                <input
                  id="c-author"
                  type="text"
                  value={createAuthor}
                  onChange={e => setCreateAuthor(e.target.value)}
                  placeholder="e.g. Alan Donovan"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="c-genres">Genres (comma-separated)</label>
                <input
                  id="c-genres"
                  type="text"
                  value={createGenres}
                  onChange={e => setCreateGenres(e.target.value)}
                  placeholder="e.g. Technology, Education"
                />
              </div>
              <div className="form-group">
                <label htmlFor="c-type">Book Type</label>
                <select
                  id="c-type"
                  value={createType}
                  onChange={e => setCreateType(e.target.value)}
                >
                  <option value="">— Select —</option>
                  <option value="0">Hardcover</option>
                  <option value="1">Paperback</option>
                  <option value="2">Ebook</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={createLoading}>
              {createLoading ? <span className="spinner" /> : null}
              {createLoading ? 'Creating…' : 'Create Book'}
            </button>
          </form>
        </div>
      )}

      {/* ── Assign tenant form ───────────────────────────── */}
      {showTenant && (
        <div className="card">
          <h2 className="card-title">Assign Tenant to Book</h2>
          {tenantError   && <div className="alert alert-error">{tenantError}</div>}
          {tenantSuccess && <div className="alert alert-success">{tenantSuccess}</div>}
          <form onSubmit={handleUpdateTenant}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="t-title">Book Title *</label>
                <input
                  id="t-title"
                  type="text"
                  value={tenantTitle}
                  onChange={e => setTenantTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="t-author">Book Author *</label>
                <input
                  id="t-author"
                  type="text"
                  value={tenantAuthor}
                  onChange={e => setTenantAuthor(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="t-id">Tenant CPF *</label>
                <input
                  id="t-id"
                  type="text"
                  value={tenantId}
                  onChange={e => setTenantId(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={tenantLoading}>
              {tenantLoading ? <span className="spinner" /> : null}
              {tenantLoading ? 'Updating…' : 'Assign Tenant'}
            </button>
          </form>
        </div>
      )}

      {/* ── Search ──────────────────────────────────────── */}
      <div className="card">
        <h2 className="card-title">Search Books</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="search-bar">
          <div className="form-group">
            <label htmlFor="s-author">Author *</label>
            <input
              id="s-author"
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Search by author name"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="form-group">
            <label htmlFor="s-genre">Genre</label>
            <input
              id="s-genre"
              type="text"
              value={genre}
              onChange={e => setGenre(e.target.value)}
              placeholder="Filter by genre"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="form-group" style={{ maxWidth: 120 }}>
            <label htmlFor="s-limit">Per page</label>
            <select
              id="s-limit"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
            >
              {LIMIT_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setPage(1); handleSearch(1); }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : '🔍'}&nbsp;Search
          </button>
        </div>

        {/* ── Results table ───────────────────────────── */}
        <div className="table-wrapper" style={{ marginTop: 20 }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genres</th>
                <th>Type</th>
                <th>Tenant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!searched && (
                <tr className="empty-row">
                  <td colSpan={6}>Enter an author name above and click Search.</td>
                </tr>
              )}
              {searched && books.length === 0 && !loading && (
                <tr className="empty-row">
                  <td colSpan={6}>No books found.</td>
                </tr>
              )}
              {books.map((book, i) => (
                <tr key={`${book.title}-${book.author}-${i}`}>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td>{book.genres?.join(', ') || '—'}</td>
                  <td>{bookTypeBadge(book.bookType)}</td>
                  <td>{book.currentTenant?.name ?? '—'}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(book)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────── */}
        {searched && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrev}
              disabled={page <= 1 || loading}
            >
              ← Prev
            </button>
            <span className="page-info">Page {page}</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleNext}
              disabled={loading}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
