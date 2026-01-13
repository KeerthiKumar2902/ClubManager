import React, { useState } from 'react';
import axios from 'axios';

const CreateEventForm = ({ token, onEventCreated }) => {
  // Added 'capacity' to state
  const [eventForm, setEventForm] = useState({ 
    title: '', description: '', date: '', location: '', capacity: 50 
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/events', eventForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onEventCreated(res.data);
      setMessage('Event Created Successfully! 🎉');
      
      // Reset form
      setEventForm({ title: '', description: '', date: '', location: '', capacity: 50 });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { 
      setMessage('Error creating event.'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-fit">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          ✨ Create New Event
        </h2>
      </div>

      <div className="p-6">
        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-semibold text-center ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleCreateEvent} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="e.g. Robotics Workshop" 
              value={eventForm.title} 
              onChange={e => setEventForm({...eventForm, title: e.target.value})} 
              required 
            />
          </div>

          {/* Date & Capacity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" 
                value={eventForm.date} 
                onChange={e => setEventForm({...eventForm, date: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition" 
                placeholder="50"
                value={eventForm.capacity} 
                onChange={e => setEventForm({...eventForm, capacity: e.target.value})} 
                required 
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition" 
              placeholder="e.g. SJT 404" 
              value={eventForm.location} 
              onChange={e => setEventForm({...eventForm, location: e.target.value})} 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" 
              placeholder="What is this event about?" 
              value={eventForm.description} 
              onChange={e => setEventForm({...eventForm, description: e.target.value})} 
              rows="3" 
            />
          </div>

          {/* Submit Button */}
          <button 
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-bold text-white shadow-md transition transform active:scale-95 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
          >
            {loading ? 'Publishing...' : 'Publish Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;