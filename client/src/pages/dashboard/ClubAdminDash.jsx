import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import EventCard from '../../components/EventCard';
import CreateEventForm from '../../components/CreateEventForm';
import EditEventModal from '../../components/EditEventModal';
import EditClubModal from '../../components/EditClubModal';
import AttendanceModal from '../../components/AttendanceModal';
import StudentDash from './StudentDash'; 

// ICONS
import { FaCrown, FaUserGraduate, FaPlus, FaCalendarAlt, FaUsers, FaChartLine, FaCog, FaTimes } from 'react-icons/fa';

const ClubAdminDash = () => {
  const { token, user } = useAuthStore();
  
  // Data
  const [myClub, setMyClub] = useState(null);
  const [events, setEvents] = useState([]);
  
  // UI State
  const [viewMode, setViewMode] = useState('admin');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingClub, setEditingClub] = useState(null);
  const [managingEvent, setManagingEvent] = useState(null);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboardData();
  }, [token, API_URL]);

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const eventsRes = await axios.get(`${API_URL}/api/events/my-events`, config);
      setEvents(eventsRes.data);

      const clubsRes = await axios.get(`${API_URL}/api/clubs`, config);
      const foundClub = clubsRes.data.find(c => c.adminId === user.id || c.admin?.email === user.email);
      setMyClub(foundClub);

    } catch (err) { console.error("Data load failed", err); }
  };

  // Handlers
  const handleNewEvent = (newEvent) => {
    setEvents([newEvent, ...events]);
    setShowCreateForm(false);
    setMessage("Event created successfully!");
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteEvent = async (id) => {
    if(!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API_URL}/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(events.filter(e => e.id !== id));
      setMessage("Event deleted.");
    } catch(err) { alert("Delete failed"); }
  };

  const handleUpdateEvent = (updated) => {
    setEvents(events.map(e => e.id === updated.id ? { ...e, ...updated } : e));
    setEditingEvent(null);
    setMessage("Event updated!");
    setTimeout(() => setMessage(''), 3000);
  };

  // Stats Calculation
  const totalAttendees = events.reduce((acc, curr) => acc + (curr._count?.registrations || 0), 0);
  const avgAttendance = events.length ? Math.round(totalAttendees / events.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen font-sans bg-gray-50">
      
      {/* 1. TOP NAV SWITCHER */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-full inline-flex gap-1 shadow-sm border border-gray-200">
          <button 
            onClick={() => setViewMode('admin')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${viewMode === 'admin' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <FaCrown /> Manage Club
          </button>
          <button 
            onClick={() => setViewMode('student')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${viewMode === 'student' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <FaUserGraduate /> My Student Profile
          </button>
        </div>
      </div>

      {message && <div className="fixed top-20 right-5 bg-black text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">{message}</div>}

      {/* 2. DUAL VIEW CONTENT */}
      {viewMode === 'student' ? (
        <StudentDash />
      ) : (
        <div className="animate-in fade-in duration-500 space-y-8">
          
          {/* A. COMPACT DASHBOARD HEADER (Profile + Stats) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Left: Club Info */}
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-3xl border border-purple-100">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{myClub?.name || "Loading..."}</h1>
                  <button onClick={() => setEditingClub(myClub)} className="text-gray-400 hover:text-purple-600 transition">
                    <FaCog />
                  </button>
                </div>
                <p className="text-gray-500 text-sm max-w-md line-clamp-1">{myClub?.description}</p>
              </div>
            </div>

            {/* Right: Quick Stats (Horizontal) */}
            <div className="flex gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-around md:justify-end">
               <div className="text-center">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Events</p>
                 <p className="text-xl font-black text-gray-800 flex items-center justify-center gap-2">
                   <FaCalendarAlt className="text-blue-500 text-sm" /> {events.length}
                 </p>
               </div>
               <div className="text-center">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Registrations</p>
                 <p className="text-xl font-black text-gray-800 flex items-center justify-center gap-2">
                   <FaUsers className="text-green-500 text-sm" /> {totalAttendees}
                 </p>
               </div>
               <div className="text-center hidden sm:block">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Attend</p>
                 <p className="text-xl font-black text-gray-800 flex items-center justify-center gap-2">
                   <FaChartLine className="text-purple-500 text-sm" /> {avgAttendance}
                 </p>
               </div>
            </div>
          </div>

          {/* B. EVENTS SECTION */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Managed Events
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{events.length}</span>
              </h2>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition font-bold shadow-md flex items-center gap-2 text-sm"
              >
                {showCreateForm ? <FaTimes /> : <FaPlus />}
                {showCreateForm ? 'Close Form' : 'Create Event'}
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm mb-8 animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-gray-800">Create New Event</h3>
                  <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-red-500">✕</button>
                </div>
                <CreateEventForm token={token} onEventCreated={handleNewEvent} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-400 text-lg font-medium">No events found.</p>
                  <p className="text-gray-400 text-sm mb-4">Get the ball rolling by creating your first event.</p>
                  <button onClick={() => setShowCreateForm(true)} className="text-purple-600 font-bold hover:underline">Create Event Now</button>
                </div>
              ) : (
                events.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    token={token}
                    isOwner={true}
                    onDelete={handleDeleteEvent}
                    onEdit={(ev) => setEditingEvent(ev)} 
                    onManage={(ev) => setManagingEvent(ev)} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {editingEvent && <EditEventModal event={editingEvent} token={token} onClose={() => setEditingEvent(null)} onUpdate={(e) => { handleUpdateEvent(e); setEditingEvent(null); }} />}
      {editingClub && <EditClubModal club={editingClub} token={token} onClose={() => setEditingClub(null)} onUpdate={(c) => { setMyClub(c); setEditingClub(null); }} />}
      
      {managingEvent && <AttendanceModal event={managingEvent} token={token} onClose={() => setManagingEvent(null)} />}
    </div>
  );
};

export default ClubAdminDash;