import React, { useState } from 'react';
import axios from 'axios';

const CreateEventForm = ({ token, onEventCreated }) => {
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });
  const [message, setMessage] = useState('');

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/events', eventForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Pass the new data back up to the Dashboard
      onEventCreated(res.data);
      
      setMessage('Event Created!');
      setEventForm({ title: '', description: '', date: '', location: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error creating event.'); }
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg border h-fit">
      {message && <p className="mb-4 text-sm text-green-600 font-bold bg-green-100 p-2 rounded text-center">{message}</p>}
      <h2 className="text-xl font-bold mb-4">Create Event</h2>
      
      <form onSubmit={handleCreateEvent} className="space-y-3">
        <input 
            className="w-full border p-2 rounded" 
            placeholder="Title" 
            value={eventForm.title} 
            onChange={e => setEventForm({...eventForm, title: e.target.value})} 
            required 
        />
        <input 
            type="datetime-local" 
            className="w-full border p-2 rounded" 
            value={eventForm.date} 
            onChange={e => setEventForm({...eventForm, date: e.target.value})} 
            required 
        />
        <input 
            className="w-full border p-2 rounded" 
            placeholder="Location" 
            value={eventForm.location} 
            onChange={e => setEventForm({...eventForm, location: e.target.value})} 
            required 
        />
        <textarea 
            className="w-full border p-2 rounded" 
            placeholder="Description" 
            value={eventForm.description} 
            onChange={e => setEventForm({...eventForm, description: e.target.value})} 
            rows="3" 
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
            Publish Event
        </button>
      </form>
    </div>
  );
};

export default CreateEventForm;