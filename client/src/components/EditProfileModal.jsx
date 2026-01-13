import React, { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const EditProfileModal = ({ onClose }) => {
  const { user, token, login } = useAuthStore(); // We need 'login' to update the global user state
  
  const [formData, setFormData] = useState({
    name: user.name,
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Basic Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload = { name: formData.name };
      if (formData.password) payload.password = formData.password;

      const res = await axios.put('http://localhost:5000/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Global State (Preserve the token, update the user object)
      // This ensures the Navbar name updates immediately without a refresh!
      login(res.data.user, token); 

      setMessage("Profile Updated! Closing...");
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 border-b flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">Update Profile</h2>
          <button onClick={onClose} className="hover:text-gray-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-2 rounded text-sm">{error}</div>}
          {message && <div className="bg-green-50 text-green-600 p-2 rounded text-sm">{message}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <hr className="my-2" />
          <p className="text-xs text-gray-500 uppercase font-bold">Change Password (Optional)</p>

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input 
              type="password"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Leave blank to keep current"
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input 
              type="password"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Confirm new password"
              value={formData.confirmPassword} 
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;