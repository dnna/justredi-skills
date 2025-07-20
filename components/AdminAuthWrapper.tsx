'use client';

import { useState, useEffect, ReactNode } from 'react';

type AdminAuthWrapperProps = {
  children: ReactNode;
};

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        // Get username from stored credentials
        const credentials = localStorage.getItem('admin_credentials');
        if (credentials) {
          const decoded = atob(credentials);
          const [storedUsername] = decoded.split(':');
          setUsername(storedUsername);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const getAuthHeaders = () => {
    const credentials = localStorage.getItem('admin_credentials');
    if (credentials) {
      return {
        Authorization: `Basic ${credentials}`,
      };
    }
    return {};
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        localStorage.setItem('admin_credentials', credentials);
        setIsAuthenticated(true);
      } else {
        setError('Λάθος στοιχεία σύνδεσης');
      }
    } catch (error) {
      setError('Σφάλμα σύνδεσης');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_credentials');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              JustRedi Admin Panel
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Συνδεθείτε για να αποκτήσετε πρόσβαση
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="username" className="sr-only">
                  Όνομα χρήστη
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Όνομα χρήστη"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Κωδικός πρόσβασης
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Κωδικός πρόσβασης"
                />
              </div>
            </div>

            {error && <div className="text-center text-sm text-red-600">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Σύνδεση...' : 'Σύνδεση'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">JustRedi Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Συνδεδεμένος ως: {username}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Αποσύνδεση
              </button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
