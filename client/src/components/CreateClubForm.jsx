import React, { useState } from 'react';
import axios from 'axios';

const CreateClubForm = ({ token, onClubCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adminEmail: '' // Changed from adminId to adminEmail
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(
        `${API_URL}/api/clubs`, 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onClubCreated(res.data); // Callback to refresh list
      setMessage('Club created successfully!');
      setFormData({ name: '', description: '', adminEmail: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg border-t-4 border-purple-600 mb-8">
      <h2 className="text-xl font-bold mb-4">👑 Manual Club Creation</h2>
      
      {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-3">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700">Club Name</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="e.g. AI Club"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Description</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            placeholder="Short description"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Assign Admin (Email)</label>
          <input 
            type="email" 
            className="w-full border p-2 rounded" 
            value={formData.adminEmail}
            onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
            required
            placeholder="student@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: This user must already be registered.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:bg-purple-300"
        >
          {loading ? 'Creating Club...' : 'Create Club'}
        </button>
      </form>
    </div>
  );
};

export default CreateClubForm;