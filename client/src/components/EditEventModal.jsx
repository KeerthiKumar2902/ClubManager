import React, { useState } from 'react';
import axios from 'axios';

const EditEventModal = ({ event, token, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    date: new Date(event.date).toISOString().slice(0, 16), // Format for datetime-local
    location: event.location,
    capacity: event.capacity
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/events/${event.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate(res.data); // Update parent state
      onClose(); // Close modal
    } catch (err) {
      alert("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Edit Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="datetime-local" className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input type="number" min="1" className="w-full border p-2 rounded" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="w-full border p-2 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border p-2 rounded" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;