import React, { useState } from 'react';
import axios from 'axios';

const EditClubModal = ({ club, token, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: club.name,
    description: club.description || '',
    adminEmail: club.admin?.email || '' // Pre-fill with current admin email
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.put(`http://localhost:5000/api/clubs/${club.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate(res.data.club); // Pass updated data back
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update club.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-purple-600 px-6 py-4 border-b flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">Edit Club Settings</h2>
          <button onClick={onClose} className="hover:text-gray-200">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-2 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Club Name</label>
            <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border p-2 rounded" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
             <label className="block text-sm font-bold text-yellow-800 mb-1">👑 Transfer Ownership</label>
             <p className="text-xs text-yellow-700 mb-2">Enter the email of an existing student to promote them to Admin. The current admin will be downgraded.</p>
             <input 
                type="email" 
                className="w-full border p-2 rounded border-yellow-400" 
                value={formData.adminEmail} 
                onChange={e => setFormData({...formData, adminEmail: e.target.value})} 
                required 
             />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;