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
import { 
  FaCrown, 
  FaUserGraduate, 
  FaPlus, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartLine, 
  FaCog, 
  FaTimes, 
  FaAddressBook,
  FaSearch,
  FaUserCircle
} from 'react-icons/fa';

const ClubAdminDash = () => {
  const { token, user } = useAuthStore();
  
  // Data
  const [myClub, setMyClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]); // <--- NEW STATE
  
  // UI State
  const [viewMode, setViewMode] = useState('admin');
  const [adminTab, setAdminTab] = useState('events'); // 'events' | 'members' <--- NEW TAB STATE
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingClub, setEditingClub] = useState(null);
  const [managingEvent, setManagingEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboardData();
  }, [token, API_URL]);

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Fetch Events
      const eventsRes = await axios.get(`${API_URL}/api/events/my-events`, config);
      setEvents(eventsRes.data);

      // 2. Fetch Club Details
      const clubsRes = await axios.get(`${API_URL}/api/clubs`, config);
      const foundClub = clubsRes.data.find(c => c.adminId === user.id || c.admin?.email === user.email);
      setMyClub(foundClub);

      // 3. Fetch Members (If club exists)
      if (foundClub) {
        try {
          const membersRes = await axios.get(`${API_URL}/api/clubs/${foundClub.id}/members`, config);
          setMembers(membersRes.data);
        } catch (err) {
          console.error("Failed to fetch members", err);
        }
      }

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

  // Filter Members
  const filteredMembers = members.filter(m => 
    m.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          {/* A. DASHBOARD HEADER (Profile + Stats) */}
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

            {/* Right: Quick Stats */}
            <div className="flex gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-around md:justify-end">
               <div className="text-center">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Members</p>
                 <p className="text-xl font-black text-gray-800 flex items-center justify-center gap-2">
                   <FaAddressBook className="text-indigo-500 text-sm" /> {members.length}
                 </p>
               </div>
               <div className="text-center">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Events</p>
                 <p className="text-xl font-black text-gray-800 flex items-center justify-center gap-2">
                   <FaCalendarAlt className="text-blue-500 text-sm" /> {events.length}
                 </p>
               </div>
               <div className="text-center hidden sm:block">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Attendees</p>
                 <p className="text-xl font-black text-gray-800 flex items-center justify-center gap-2">
                   <FaUsers className="text-green-500 text-sm" /> {totalAttendees}
                 </p>
               </div>
            </div>
          </div>

          {/* B. MAIN CONTENT AREA (Tabs) */}
          <div>
            {/* Tab Navigation */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              <button 
                onClick={() => setAdminTab('events')}
                className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition relative ${adminTab === 'events' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaCalendarAlt /> Managed Events
                {adminTab === 'events' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full"></span>}
              </button>
              <button 
                onClick={() => setAdminTab('members')}
                className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition relative ${adminTab === 'members' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaAddressBook /> Member Directory
                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full ml-1">{members.length}</span>
                {adminTab === 'members' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full"></span>}
              </button>
            </div>

            {/* TAB 1: EVENTS LIST */}
            {adminTab === 'events' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition font-bold shadow-md flex items-center gap-2 text-sm"
                  >
                    {showCreateForm ? <FaTimes /> : <FaPlus />}
                    {showCreateForm ? 'Close Form' : 'Create Event'}
                  </button>
                </div>

                {showCreateForm && (
                  <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm mb-8">
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
            )}

            {/* TAB 2: MEMBERS LIST */}
            {adminTab === 'members' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  
                  {/* Search Bar */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <FaSearch className="text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search members by name or email..." 
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      {members.length === 0 ? "No members yet. Invite students to join!" : "No members found matching your search."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                          <tr>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Joined Date</th>
                            <th className="px-6 py-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredMembers.map((member) => (
                            <tr key={member.student.id} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                  <FaUserCircle />
                                </div>
                                {member.student.name}
                              </td>
                              <td className="px-6 py-4">{member.student.email}</td>
                              <td className="px-6 py-4">{new Date(member.joinedAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Active</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
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