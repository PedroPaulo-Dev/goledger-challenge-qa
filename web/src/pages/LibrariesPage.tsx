import { useState } from 'react';
import { createLibrary, getLibraryBookCount } from '../api';

export default function LibrariesPage() {
  // ── Create library ────────────────────────────────────────
  const [createName, setCreateName]       = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError]     = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreateLoading(true);
    try {
      await createLibrary(createName.trim());
      setCreateSuccess(`Library "${createName.trim()}" created successfully!`);
      setCreateName('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create library.');
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Book count ────────────────────────────────────────────
  const [queryName, setQueryName]     = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError]   = useState('');
  const [bookCount, setBookCount]     = useState<number | null>(null);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueryError('');
    setBookCount(null);
    setQueryLoading(true);
    try {
      const result = await getLibraryBookCount(queryName.trim());
      setBookCount(result.numberOfBooks);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Failed to fetch book count.');
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Libraries</h1>
      </div>

      {/* ── Create library ─────────────────────────────── */}
      <div className="card">
        <h2 className="card-title">Create New Library</h2>
        {createError   && <div className="alert alert-error">{createError}</div>}
        {createSuccess && <div className="alert alert-success">{createSuccess}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="lib-name">Library Name *</label>
            <input
              id="lib-name"
              type="text"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              placeholder="e.g. Central Library"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={createLoading}>
            {createLoading ? <span className="spinner" /> : null}
            {createLoading ? 'Creating…' : 'Create Library'}
          </button>
        </form>
      </div>

      {/* ── Book count query ───────────────────────────── */}
      <div className="card">
        <h2 className="card-title">Query Book Count</h2>
        <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: 16 }}>
          Retrieve the number of books currently registered in a library.
        </p>
        {queryError && <div className="alert alert-error">{queryError}</div>}
        <form onSubmit={handleQuery}>
          <div className="form-group">
            <label htmlFor="q-name">Library Name *</label>
            <input
              id="q-name"
              type="text"
              value={queryName}
              onChange={e => setQueryName(e.target.value)}
              placeholder="e.g. Central Library"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={queryLoading}>
            {queryLoading ? <span className="spinner" /> : '📊'}&nbsp;
            {queryLoading ? 'Loading…' : 'Get Count'}
          </button>
        </form>

        {bookCount !== null && (
          <div className="alert alert-info" style={{ marginTop: 16 }}>
            <strong>{queryName}</strong> has <strong>{bookCount}</strong> book
            {bookCount !== 1 ? 's' : ''} registered.
          </div>
        )}
      </div>
    </div>
  );
}
