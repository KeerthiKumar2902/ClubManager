import React from 'react';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaClock, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const EventCard = ({ event, token, isOwner, onDelete, onEdit, onManage, showRegister = false }) => {
  
  const handleRegister = async () => {
    if(!window.confirm(`Register for ${event.title}?`)) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/events/${event.id}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Registration Successful!");
    } catch(err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const isFull = (event._count?.registrations || 0) >= event.capacity;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      
      {/* IMAGE HEADER */}
      <div className="h-48 relative overflow-hidden bg-gray-100">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
          />
        ) : (
          // Fallback Gradient
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex flex-col justify-end text-white">
            <h3 className="text-2xl font-bold leading-tight">{event.title}</h3>
            <p className="text-sm opacity-90">{event.club?.name}</p>
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex flex-col items-center">
          <span className="text-red-500 uppercase tracking-wide">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
          <span className="text-xl text-gray-900">{new Date(event.date).getDate()}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex-1 flex flex-col">
        {/* If image exists, show title here instead */}
        {event.imageUrl && (
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{event.title}</h3>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">{event.club?.name}</p>
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-400" />
            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-gray-400" />
            <span>{event._count?.registrations || 0} / {event.capacity} Attending</span>
          </div>
        </div>

        {/* ACTIONS FOOTER */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          {isOwner ? (
            <div className="flex gap-2 w-full">
              <button onClick={() => onManage(event)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                <FaCheckCircle /> Manage
              </button>
              <button onClick={() => onEdit(event)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition"><FaEdit /></button>
              <button onClick={() => onDelete(event.id)} className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition"><FaTrash /></button>
            </div>
          ) : showRegister ? (
            <button 
              onClick={handleRegister} 
              disabled={isFull}
              className={`w-full py-2.5 rounded-xl font-bold text-sm shadow-md transition transform active:scale-95 ${
                isFull 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isFull ? 'Housefull' : 'Register Now'}
            </button>
          ) : (
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">View Only</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;