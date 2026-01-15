import React from 'react';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaClock, FaEdit, FaTrash, FaCheckCircle, FaCog } from 'react-icons/fa';
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group h-full">
      
      {/* IMAGE HEADER */}
      <div className="h-48 relative overflow-hidden bg-gray-100 shrink-0">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex flex-col justify-end text-white">
            <h3 className="text-2xl font-bold leading-tight drop-shadow-md">{event.title}</h3>
            <p className="text-sm opacity-90">{event.club?.name}</p>
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex flex-col items-center border border-gray-200">
          <span className="text-red-500 uppercase tracking-wide text-[10px]">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
          <span className="text-xl text-gray-900 leading-none">{new Date(event.date).getDate()}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex-1 flex flex-col">
        {event.imageUrl && (
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition">{event.title}</h3>
          </div>
        )}

        {/* --- DESCRIPTION ADDED HERE --- */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {event.description || "No description provided."}
        </p>
        {/* ----------------------------- */}

        <div className="flex flex-wrap gap-2 mb-4">
            {/* Time Pill */}
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                <FaClock className="text-[10px]" />
                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {/* Location Pill */}
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-100 max-w-full">
                <FaMapMarkerAlt className="text-[10px]" />
                <span className="truncate max-w-[150px]">{event.location}</span>
            </span>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                <span>Attendance</span>
                <span>{event._count?.registrations || 0} / {event.capacity}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${Math.min(100, ((event._count?.registrations || 0) / event.capacity) * 100)}%` }}
                ></div>
            </div>
        </div>

        {/* ACTIONS FOOTER */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
          {isOwner ? (
            <>
              <button 
                onClick={() => onManage(event)} 
                className="flex-1 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg transform active:scale-95"
              >
                <FaCheckCircle className="text-green-400" /> Manage
              </button>
              <button onClick={() => onEdit(event)} className="bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-2.5 rounded-xl transition border border-gray-200">
                <FaEdit />
              </button>
              <button onClick={() => onDelete(event.id)} className="bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 p-2.5 rounded-xl transition border border-gray-200">
                <FaTrash />
              </button>
            </>
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
            <span className="w-full text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-2">View Only</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;