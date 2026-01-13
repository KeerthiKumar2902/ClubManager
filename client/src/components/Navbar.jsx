import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition">
            UniClub 🎓
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-4 items-center">
            <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded transition">
              Events
            </Link>

            {!user ? (
              // GUEST VIEW
              <>
                <Link to="/login" className="hover:bg-gray-700 px-3 py-2 rounded transition">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              // LOGGED IN VIEW
              <>
                <Link 
                  to="/dashboard" 
                  className="hover:bg-gray-700 px-3 py-2 rounded transition"
                >
                  {user.role === 'CLUB_ADMIN' ? 'Admin Panel' : 'My Dashboard'}
                </Link>
                
                <div className="flex items-center space-x-4 ml-4 bg-gray-800 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-300">
                    {user.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 text-sm font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;