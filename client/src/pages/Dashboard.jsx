import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // State for List of Events
  const [myEvents, setMyEvents] = useState([]);
  
  // State for New Event Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const [message, setMessage] = useState('');

  // 1. Fetch My Club's Events on Load
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events/my-events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };

    fetchMyEvents();
  }, [user, token, navigate]);

  // 2. Handle Form Submit
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/events', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Success! Add new event to list immediately (Optimistic UI)
      setMyEvents([res.data, ...myEvents]);
      setMessage('Event created successfully!');
      setFormData({ title: '', description: '', date: '', location: '' }); // Reset form
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      setMessage('Error creating event. Are you a Club Admin?');
    }
  };

  if (!user) return null;

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">Club Dashboard</h1>
           <p className="text-gray-600">Managing as: {user.name}</p>
        </div>
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create Event Form */}
        <div className="bg-white p-6 rounded shadow-lg border h-fit">
          <h2 className="text-xl font-bold mb-4">Create New Event</h2>
          {message && <p className="mb-4 text-sm text-blue-600 font-semibold">{message}</p>}
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Event Title</label>
              <input 
                className="w-full border p-2 rounded" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input 
                type="datetime-local"
                className="w-full border p-2 rounded" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input 
                className="w-full border p-2 rounded" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea 
                className="w-full border p-2 rounded" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
              Publish Event
            </button>
          </form>
        </div>

        {/* Right Column: List of My Events */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Upcoming Events</h2>
          
          {myEvents.length === 0 ? (
            <p className="text-gray-500">No events found. Create one!</p>
          ) : (
            myEvents.map(event => (
              <div key={event.id} className="bg-white p-5 rounded shadow border-l-4 border-blue-500 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()} @ {event.location}</p>
                  <p className="mt-2 text-gray-700">{event.description}</p>
                </div>
                {/* Future: Add Delete Button Here */}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;