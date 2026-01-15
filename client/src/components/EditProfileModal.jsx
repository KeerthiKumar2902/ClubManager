import React, { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { FaUser, FaLock, FaKey, FaTimes, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const EditProfileModal = ({ onClose }) => {
  const { user, token, login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user.name,
    currentPassword: '', 
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Strict Password Regex: Min 8 chars, 1 letter, 1 number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // --- VALIDATION ---
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError("New passwords do not match.");
        setLoading(false);
        return;
      }
      if (!passwordRegex.test(formData.password)) {
        setError("New password is too weak. (Min 8 chars, 1 letter, 1 number)");
        setLoading(false);
        return;
      }
      if (!formData.currentPassword) {
        setError("To set a new password, you must enter your Current Password.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = { name: formData.name };
      // Only send password fields if the user intends to change it
      if (formData.password) {
        payload.password = formData.password;
        payload.currentPassword = formData.currentPassword;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.put(`${API_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // --- CRITICAL FIX: Update Local State ---
      // We pass 'token' first, then the 'user' object.
      // This prevents the "Empty Page" crash.
      login(token, res.data.user); 

      setMessage("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 border-b border-gray-700 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaUser className="text-purple-400" /> Edit Profile
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-full transition"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-pulse">
              <FaExclamationCircle /> {error}
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-100">
              <FaCheckCircle /> {message}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaLock className="text-purple-500" /> Change Password <span className="text-gray-400 font-normal text-xs">(Optional)</span>
            </p>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="text-gray-400 group-focus-within:text-purple-500 transition" />
                </div>
                <input 
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm bg-gray-50 focus:bg-white" 
                  placeholder="Current Password (Required to change)"
                  value={formData.currentPassword} 
                  onChange={e => setFormData({...formData, currentPassword: e.target.value})} 
                />
              </div>

              {/* New & Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm bg-gray-50 focus:bg-white" 
                  placeholder="New Password"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                <input 
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm bg-gray-50 focus:bg-white" 
                  placeholder="Confirm New"
                  value={formData.confirmPassword} 
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 font-bold rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition shadow-lg flex items-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><FaSave /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;