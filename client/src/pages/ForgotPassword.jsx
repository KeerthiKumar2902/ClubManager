import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Fetch the live Render URL from Vercel's environment variables
    // It falls back to localhost if you are testing on your own computer
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      // Use the dynamic API_URL here!
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage('Password reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password?</h2>
        <p className="text-gray-600 text-center mb-6">Enter your email and we'll send you a link to reset your password.</p>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline text-sm">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;