import React, { useState } from 'react';
import axios from 'axios';

const RequestClubModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Get Token
  const token = localStorage.getItem('token');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clubs/request`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', description: '' });
      }, 2000); // Close after 2 seconds
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-black">✖</button>
        
        <h2 className="text-xl font-bold mb-4">Start a New Club</h2>
        
        {success ? (
          <div className="text-green-600 text-center py-6">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-bold">Request Submitted!</p>
            <p className="text-sm">Wait for Admin approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Club Name</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="e.g. Robotics Club"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Why do you want this club?</label>
              <textarea 
                className="w-full border p-2 rounded" 
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                placeholder="Briefly explain your vision..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestClubModal;