import React, { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore'; // <--- Import Store

const EditClubModal = ({ club, token, onClose, onUpdate }) => {
  const { user } = useAuthStore(); // <--- Get current user
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [formData, setFormData] = useState({
    name: club.name,
    description: club.description || '',
    adminEmail: club.admin?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Send the data. The backend will ignore name/adminEmail if user is not Super Admin
      const res = await axios.put(`${API_URL}/api/clubs/${club.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate(res.data.club || res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update club.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-purple-600 px-6 py-4 border-b flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">
            {isSuperAdmin ? 'Edit Club Settings' : 'Update Club Details'}
          </h2>
          <button onClick={onClose} className="hover:text-gray-200">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-2 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Club Name</label>
            <input 
              className={`w-full border p-2 rounded ${!isSuperAdmin ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
              disabled={!isSuperAdmin} // <--- LOCKED for Club Admin
            />
            {!isSuperAdmin && <p className="text-xs text-gray-400 mt-1">Contact Super Admin to change name.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
              rows="4" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Tell students what your club is about..."
            />
          </div>
          
          {/* --- OWNER SECTION: ONLY FOR SUPER ADMIN --- */}
          {isSuperAdmin ? (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
               <label className="block text-sm font-bold text-yellow-800 mb-1">👑 Transfer Ownership</label>
               <p className="text-xs text-yellow-700 mb-2">Enter email of the NEW admin. Old admin becomes a student.</p>
               <input 
                  type="email" 
                  className="w-full border p-2 rounded border-yellow-400" 
                  value={formData.adminEmail} 
                  onChange={e => setFormData({...formData, adminEmail: e.target.value})} 
                  required 
               />
            </div>
          ) : (
            // Read Only View for Club Admin
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
               <label className="block text-sm font-bold text-gray-700 mb-1">Current Owner</label>
               <div className="text-sm text-gray-600 flex items-center gap-2">
                 <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">YOU</span>
                 {user.email}
               </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;