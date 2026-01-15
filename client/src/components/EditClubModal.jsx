import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaCamera, FaImage } from 'react-icons/fa';

const EditClubModal = ({ club, token, onClose, onUpdate }) => {
  const [description, setDescription] = useState(club.description || '');
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  
  // Previews
  const [logoPreview, setLogoPreview] = useState(club.logoUrl);
  const [bannerPreview, setBannerPreview] = useState(club.bannerUrl);

  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('description', description);
    if (logoFile) formData.append('logo', logoFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.put(`${API_URL}/api/clubs/${club.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onUpdate(res.data);
    } catch (err) {
      alert("Failed to update club");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Edit Club Appearance</h2>
          <button onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Club Banner</label>
            <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 group">
              {bannerPreview ? (
                <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400"><FaImage className="text-2xl" /></div>
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-bold">
                Change Banner
                <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
              </label>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group shrink-0">
              {logoPreview ? (
                <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400"><FaCamera /></div>
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Club Logo</label>
              <p className="text-xs text-gray-500">Square image recommended.</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;