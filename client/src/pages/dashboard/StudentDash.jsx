import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import RequestClubModal from '../../components/RequestClubModal';
import EditProfileModal from '../../components/EditProfileModal';

// ICONS
import { FaTicketAlt, FaCalendarCheck, FaMapMarkerAlt, FaClock, FaPlus, FaUserEdit } from 'react-icons/fa';

const StudentDash = () => {
  const { token, user } = useAuthStore();
  
  const [myTickets, setMyTickets] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTickets();
  }, [token, API_URL]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events/my-registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTickets(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCancelTicket = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this ticket?")) return;
    try {
      await axios.delete(`${API_URL}/api/events/${eventId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTickets(myTickets.filter(item => item.event.id !== eventId));
      setMessage("Ticket Cancelled successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to cancel."); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaTicketAlt className="text-purple-600" /> My Ticket Wallet
          </h1>
          <p className="text-gray-500">Manage your upcoming events and passes.</p>
        </div>
        
        <div className="flex gap-3">
           <button 
            onClick={() => setShowProfileModal(true)} 
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
          >
            <FaUserEdit /> Edit Profile
          </button>
          
          {/* Only show "Start Club" if pure Student */}
          {user.role === 'STUDENT' && (
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition font-bold flex items-center gap-2 shadow-lg"
            >
              <FaPlus /> Start a Club
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="fixed top-5 right-5 bg-black text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
          {message}
        </div>
      )}

      {/* Tickets Grid */}
      {myTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <FaTicketAlt className="mx-auto text-6xl text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No active tickets</h3>
          <p className="text-gray-500 mb-6">Explore the homepage to find events!</p>
          <a href="/" className="text-purple-600 font-bold hover:underline">Browse Events →</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden hover:shadow-md transition">
              {/* Ticket Top (Banner) */}
              <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white flex flex-col justify-between relative">
                <div className="font-bold opacity-90 text-sm tracking-wider uppercase">{ticket.event.club?.name || 'Event Pass'}</div>
                <h3 className="text-xl font-bold truncate leading-tight">{ticket.event.title}</h3>
                
                {/* Decorative Circles for Ticket Look */}
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gray-50 rounded-full z-10"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full z-10"></div>
              </div>

              {/* Ticket Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCalendarCheck className="text-indigo-500" />
                    <span className="font-medium">{new Date(ticket.event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaClock className="text-indigo-500" />
                    <span className="font-medium">{new Date(ticket.event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaMapMarkerAlt className="text-indigo-500" />
                    <span className="font-medium truncate">{ticket.event.location}</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-200">
                    Registered
                  </span>
                  <button 
                    onClick={() => handleCancelTicket(ticket.event.id)} 
                    className="text-red-500 text-xs font-bold hover:text-red-700 hover:underline"
                  >
                    Cancel Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <RequestClubModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
      {showProfileModal && <EditProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};

export default StudentDash;