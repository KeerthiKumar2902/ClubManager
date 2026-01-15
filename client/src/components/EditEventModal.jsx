import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaCloudUploadAlt, FaTrash } from 'react-icons/fa';

const EditEventModal = ({ event, token, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    date: new Date(event.date).toISOString().split('T')[0],
    time: new Date(event.date).toTimeString().slice(0,5),
    location: event.location,
    capacity: event.capacity
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(event.imageUrl);
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

    const combinedDate = new Date(`${formData.date}T${formData.time}`);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', combinedDate.toISOString());
    data.append('location', formData.location);
    data.append('capacity', formData.capacity);
    
    if (imageFile) {
        data.append('image', imageFile);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.put(`${API_URL}/api/events/${event.id}`, data, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      onUpdate(res.data);
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Edit Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-2 text-center hover:bg-gray-50 transition cursor-pointer group">
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Event Poster" className="w-full h-40 object-cover rounded-lg" />
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold cursor-pointer">
                    <FaCloudUploadAlt className="text-2xl mb-1"/> Change Poster
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer block py-8">
                <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 group-hover:text-purple-500 transition" />
                <span className="block mt-2 text-sm font-medium text-gray-500">Upload Event Poster</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input className="border p-3 rounded-lg w-full" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <input className="border p-3 rounded-lg w-full" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input type="date" className="border p-3 rounded-lg w-full" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <input type="time" className="border p-3 rounded-lg w-full" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
            <input type="number" className="border p-3 rounded-lg w-full" placeholder="Cap" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
          </div>

          <textarea className="border p-3 rounded-lg w-full" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
            {loading ? 'Saving...' : 'Update Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;