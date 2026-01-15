import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const CreateEventForm = ({ token, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 50
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Combine Date & Time
    const combinedDate = new Date(`${formData.date}T${formData.time}`);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', combinedDate.toISOString());
    data.append('location', formData.location);
    data.append('capacity', formData.capacity);
    if (imageFile) data.append('image', imageFile);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/events`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onEventCreated(res.data);
      // Reset form
      setFormData({ title: '', description: '', date: '', time: '', location: '', capacity: 50 });
      setImageFile(null);
      setPreview(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload Area */}
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer group">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <button type="button" onClick={() => {setImageFile(null); setPreview(null)}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"><FaTimes /></button>
          </div>
        ) : (
          <label className="cursor-pointer block py-8">
            <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 group-hover:text-purple-500 transition" />
            <span className="block mt-2 text-sm font-medium text-gray-500">Click to upload Event Poster</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-3 rounded-lg w-full" placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <input className="border p-3 rounded-lg w-full" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <input type="date" className="border p-3 rounded-lg w-full" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        <input type="time" className="border p-3 rounded-lg w-full" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
        <input type="number" className="border p-3 rounded-lg w-full" placeholder="Capacity" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
      </div>

      <textarea className="border p-3 rounded-lg w-full" rows="3" placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />

      <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition">
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};

export default CreateEventForm;