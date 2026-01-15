import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password Rule: Min 8 chars, at least 1 letter and 1 number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Strict Validation
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }
    
    if (!passwordRegex.test(newPassword)) {
      return setError("Password must be at least 8 characters long and contain at least one letter and one number.");
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Token may be expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Password</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Enter a new secure password for your account.</p>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm font-medium border border-green-200">{message}</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
            <input 
              type="password" 
              required
              placeholder="Min 8 chars, 1 letter, 1 number"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
            <input 
              type="password" 
              required
              placeholder="Retype password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-lg mt-2"
          >
            Set New Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;