import { useState, useCallback } from 'react';
import { isTokenPresent, storeToken } from './api';
import type { Page } from './types';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import PersonsPage from './pages/PersonsPage';
import LibrariesPage from './pages/LibrariesPage';

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(isTokenPresent);
  const [currentPage, setCurrentPage] = useState<Page>(() =>
    isTokenPresent() ? 'books' : 'login',
  );

  const handleLogin = useCallback((token: string) => {
    storeToken(token);
    setAuthenticated(true);
    setCurrentPage('books');
  }, []);

  const handleLogout = useCallback(() => {
    setAuthenticated(false);
    setCurrentPage('login');
  }, []);

  const navigate = useCallback(
    (page: Page) => {
      if (!authenticated && page !== 'login' && page !== 'register') {
        setCurrentPage('login');
        return;
      }
      setCurrentPage(page);
    },
    [authenticated],
  );

  const renderPage = () => {
    if (!authenticated) {
      if (currentPage === 'register') {
        return (
          <RegisterPage
            onRegistered={() => setCurrentPage('login')}
            onGoLogin={() => navigate('login')}
          />
        );
      }
      return <LoginPage onLogin={handleLogin} onGoRegister={() => navigate('register')} />;
    }

    switch (currentPage) {
      case 'persons':
        return <PersonsPage />;
      case 'libraries':
        return <LibrariesPage />;
      case 'books':
      default:
        return <BooksPage />;
    }
  };

  return (
    <>
      <Navbar
        authenticated={authenticated}
        currentPage={currentPage}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      {renderPage()}
    </>
  );
}
