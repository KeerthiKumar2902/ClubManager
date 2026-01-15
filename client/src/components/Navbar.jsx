import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  FaUniversity, 
  FaCalendarAlt, 
  FaUsers, 
  FaSignInAlt, 
  FaUserPlus, 
  FaTachometerAlt, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  // Helper to highlight active link
  const isActive = (path) => location.pathname === path ? "text-purple-400" : "text-gray-300 hover:text-white";

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 1. Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-purple-400 transition group">
            <div className="bg-purple-600 p-2 rounded-lg group-hover:bg-purple-500 transition">
              <FaUniversity className="text-white" />
            </div>
            <span>UniClub</span>
          </Link>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`flex items-center gap-2 text-sm font-medium transition ${isActive('/')}`}>
              <FaCalendarAlt /> Events
            </Link>
            <Link to="/clubs" className={`flex items-center gap-2 text-sm font-medium transition ${isActive('/clubs')}`}>
              <FaUsers /> Clubs
            </Link>

            {!user ? (
              // GUEST VIEW
              <div className="flex items-center gap-4 ml-4">
                <Link to="/login" className="text-gray-300 hover:text-white font-medium text-sm flex items-center gap-2">
                  <FaSignInAlt /> Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-bold transition shadow-lg hover:shadow-purple-500/30 flex items-center gap-2"
                >
                  <FaUserPlus /> Sign Up
                </Link>
              </div>
            ) : (
              // LOGGED IN VIEW
              <div className="flex items-center gap-6 ml-4">
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-2 text-sm font-medium transition ${isActive('/dashboard')}`}
                >
                  <FaTachometerAlt /> Dashboard
                </Link>
                
                <div className="pl-6 border-l border-gray-700 flex items-center gap-4">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Welcome</p>
                    <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white p-2 rounded-full transition-all duration-300"
                    title="Logout"
                  >
                    <FaSignOutAlt />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white text-2xl focus:outline-none">
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Menu (Dropdown) */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Events
            </Link>
            <Link 
              to="/clubs" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Clubs
            </Link>

            {!user ? (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 mt-2 rounded-md text-base font-bold bg-purple-600 text-white text-center"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  Logout ({user.name})
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;