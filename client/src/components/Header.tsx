import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSnackbar } = useSnackbar();

  const handleLogout = async () => {
    try {
      await logout();
      showSnackbar('Logged out successfully!');
    } catch (err) {
      showSnackbar('Logout failed', 'error');
    }
  };

  if (!user) return null;

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
        <span className="font-semibold text-gray-700 text-base truncate max-w-xs" title={user.email}>{user.email}</span>
      </div>
      <button
        onClick={handleLogout}
        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-colors duration-200"
      >
        Logout
      </button>
    </header>
  );
};

export default Header; 