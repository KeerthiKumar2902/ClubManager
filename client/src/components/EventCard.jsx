import React from 'react';
import { FaMapMarkerAlt, FaClock, FaEdit, FaTrash, FaUsers, FaChartPie } from 'react-icons/fa';

const EventCard = ({ event, isOwner, onDelete, onEdit, onManage }) => {
  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Calculate Capacity Logic
  const registeredCount = event._count?.registrations || 0;
  const capacity = event.capacity || 50;
  const percentage = Math.min((registeredCount / capacity) * 100, 100);
  
  // Color logic for bar
  let barColor = 'bg-green-500';
  if (percentage > 50) barColor = 'bg-yellow-500';
  if (percentage > 90) barColor = 'bg-red-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      
      {/* 1. Header Banner */}
      <div className="h-28 bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 group-hover:scale-105 transition-transform duration-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
        
        {/* Date Badge */}
        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white border border-white/20 p-2 rounded-lg text-center min-w-[50px]">
          <p className="text-xs font-bold uppercase tracking-wider">{eventDate.toLocaleString('default', { month: 'short' })}</p>
          <p className="text-xl font-black leading-none">{eventDate.getDate()}</p>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1" title={event.title}>
            {event.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1"><FaMapMarkerAlt /> {event.location}</span>
            <span className="flex items-center gap-1"><FaClock /> {timeStr}</span>
          </div>
        </div>

        {/* Capacity Bar (The New Feature) */}
        <div className="mt-auto mb-4">
          <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
            <span className="flex items-center gap-1"><FaUsers /> Registrations</span>
            <span>{registeredCount} / {capacity}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-1000 ${barColor}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* 3. Action Grid (Admin Only) */}
        {isOwner && (
          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-gray-100">
            <button 
              onClick={() => onEdit(event)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              <FaEdit /> Edit
            </button>
            <button 
              onClick={() => onManage(event)} // Calls the Attendance Modal
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
            >
              <FaChartPie /> Manage
            </button>
            <button 
              onClick={() => onDelete(event.id)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;