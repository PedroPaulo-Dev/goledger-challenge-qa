import type { Page } from '../types';

interface NavbarProps {
  authenticated: boolean;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function Navbar({ authenticated, currentPage, onNavigate, onLogout }: NavbarProps) {
  return (
    <nav className="navbar">
      <span className="navbar-brand">📚 Library Manager</span>
      {authenticated && (
        <div className="navbar-links">
          <button
            className={`nav-link ${currentPage === 'books' ? 'active' : ''}`}
            onClick={() => onNavigate('books')}
          >
            Books
          </button>
          <button
            className={`nav-link ${currentPage === 'persons' ? 'active' : ''}`}
            onClick={() => onNavigate('persons')}
          >
            Persons
          </button>
          <button
            className={`nav-link ${currentPage === 'libraries' ? 'active' : ''}`}
            onClick={() => onNavigate('libraries')}
          >
            Libraries
          </button>
          <button className="nav-link logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
