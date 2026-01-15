import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { FaUser, FaLock, FaKey, FaTimes, FaSave, FaCamera, FaCheck, FaCircle } from 'react-icons/fa';

const EditProfileModal = ({ onClose }) => {
  const { user, token, login } = useAuthStore();
  
  const [name, setName] = useState(user.name);
  const [file, setFile] = useState(null); 
  const [preview, setPreview] = useState(user.avatar); 
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password Validation State
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false, upper: false, lower: false, number: false, special: false
  });
  const [isPasswordValid, setIsPasswordValid] = useState(true); // Default true if not changing pw

  // Monitor Password Strength
  useEffect(() => {
    const p = passwords.new;
    if (!p) {
      setIsPasswordValid(true); // Valid if empty (user not changing password)
      return;
    }
    const criteria = {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
    };
    setPasswordCriteria(criteria);
    setIsPasswordValid(Object.values(criteria).every(Boolean));
  }, [passwords.new]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Validation Checks
    if (passwords.new) {
        if (!isPasswordValid) { setError("New password is too weak."); return; }
        if (passwords.new !== passwords.confirm) { setError("New passwords do not match."); return; }
        if (!passwords.current) { setError("Current password is required to set a new one."); return; }
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    if (file) formData.append('avatar', file);
    if (passwords.new) {
      formData.append('password', passwords.new);
      formData.append('currentPassword', passwords.current);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.put(`${API_URL}/api/auth/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      login(token, res.data.user);
      setMessage("Profile Updated!");
      setTimeout(onClose, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2"><FaUser /> Edit Profile</h2>
          <button onClick={onClose} className="hover:text-gray-300 transition"><FaTimes /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border-l-4 border-red-500 font-medium">{error}</div>}
            {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm border-l-4 border-green-500 font-medium">{message}</div>}

            {/* Avatar Upload */}
            <div className="flex justify-center">
                <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                    {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl"><FaUser /></div>
                    )}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-md transition transform group-hover:scale-110">
                    <FaCamera size={12} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                </div>
            </div>

            {/* Name */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700"><FaLock className="text-purple-500"/> Change Password</p>
                
                <input 
                    type="password" 
                    placeholder="Current Password (Required to change)" 
                    className="w-full border border-gray-300 p-2.5 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition" 
                    value={passwords.current} 
                    onChange={e => setPasswords({...passwords, current: e.target.value})} 
                />
                
                <div className="flex gap-2 mb-3">
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        className={`w-full border p-2.5 rounded-lg text-sm focus:ring-2 outline-none transition ${passwords.new && !isPasswordValid ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-500'}`}
                        value={passwords.new} 
                        onChange={e => setPasswords({...passwords, new: e.target.value})} 
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm New" 
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition" 
                        value={passwords.confirm} 
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                    />
                </div>

                {/* Password Criteria Checklist (Only show if typing new password) */}
                {passwords.new && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-2 gap-2 text-xs">
                        <CriteriaItem met={passwordCriteria.length} label="8+ chars" />
                        <CriteriaItem met={passwordCriteria.upper} label="Uppercase" />
                        <CriteriaItem met={passwordCriteria.lower} label="Lowercase" />
                        <CriteriaItem met={passwordCriteria.number} label="Number" />
                        <CriteriaItem met={passwordCriteria.special} label="Symbol" />
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                disabled={loading || (passwords.new && !isPasswordValid)} 
                className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center justify-center gap-2"
            >
                {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

// Helper for checklist
const CriteriaItem = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 transition-colors duration-200 ${met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
    {met ? <FaCheck className="text-[10px]" /> : <FaCircle className="text-[4px]" />}
    {label}
  </div>
);

export default EditProfileModal;