import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaTimes, FaExclamationCircle } from 'react-icons/fa';

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
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError('');

    if (file) {
      // 1. Client-Side Size Validation (5MB Limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Max limit is 5MB.");
        return;
      }

      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        // Handle Multer "File too large" error specifically if it slips through
        if (err.response?.status === 500 && err.response?.data?.error?.includes('File too large')) {
            setError("Server rejected file: Too large (Max 5MB).");
        } else {
            setError(err.response?.data?.error || "Failed to create event");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-pulse">
            <FaExclamationCircle /> {error}
        </div>
      )}

      {/* Image Upload Area */}
      <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer group ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}>
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <button type="button" onClick={() => {setImageFile(null); setPreview(null)}} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition"><FaTimes /></button>
          </div>
        ) : (
          <label className="cursor-pointer block py-6">
            <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 group-hover:text-purple-500 transition" />
            <span className="block mt-2 text-sm font-bold text-gray-600">Click to upload Event Poster</span>
            {/* Added Helper Text */}
            <span className="block mt-1 text-xs text-gray-400">(Max Size: 5MB)</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <input className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <input type="date" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500 transition" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        <input type="time" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500 transition" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
        <input type="number" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Capacity" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
      </div>

      <textarea className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-purple-500 transition" rows="3" placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />

      <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition flex justify-center items-center gap-2">
        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Create Event'}
      </button>
    </form>
  );
};

export default CreateEventForm;