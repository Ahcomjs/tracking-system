'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

const Navbar: React.FC = () => {
  const { isAuthenticated, userName, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold rounded-md px-3 py-1 hover:bg-blue-700 transition-colors">
          📦 Universal Tracker
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-white text-lg font-medium">Hello, {userName || 'User'}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
