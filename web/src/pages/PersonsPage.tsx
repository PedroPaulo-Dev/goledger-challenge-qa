import { useState } from 'react';
import { createPerson, type CreatePersonData } from '../api';

export default function PersonsPage() {
  const [id, setId]                   = useState('');
  const [name, setName]               = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [height, setHeight]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const data: CreatePersonData = { id, name };
    if (dateOfBirth) data.dateOfBirth = new Date(dateOfBirth).toISOString();
    if (height)      data.height = parseFloat(height);

    try {
      await createPerson(data);
      setSuccess(`Person "${name}" created successfully!`);
      setId('');
      setName('');
      setDateOfBirth('');
      setHeight('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create person.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Persons</h1>
      </div>

      <div className="card">
        <h2 className="card-title">Register New Person</h2>
        <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: 16 }}>
          Persons are stored on the blockchain and identified by their Brazilian CPF number.
        </p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="p-id">CPF *</label>
              <input
                id="p-id"
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="p-name">Full Name *</label>
              <input
                id="p-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alice Souza"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="p-dob">Date of Birth</label>
              <input
                id="p-dob"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="p-height">Height (m)</label>
              <input
                id="p-height"
                type="number"
                step="0.01"
                min="0"
                max="3"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="e.g. 1.70"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Registering…' : 'Register Person'}
          </button>
        </form>
      </div>
    </div>
  );
}
