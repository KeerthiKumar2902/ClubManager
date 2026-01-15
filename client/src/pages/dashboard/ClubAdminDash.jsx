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
  FaUserCircle,
  FaTrash
} from 'react-icons/fa';

const ClubAdminDash = () => {
  const { token, user } = useAuthStore();
  
  // Data
  const [myClub, setMyClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  
  // UI State
  const [viewMode, setViewMode] = useState('admin');
  const [adminTab, setAdminTab] = useState('events'); 
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
      
      const eventsRes = await axios.get(`${API_URL}/api/events/my-events`, config);
      setEvents(eventsRes.data);

      const clubsRes = await axios.get(`${API_URL}/api/clubs`, config);
      const foundClub = clubsRes.data.find(c => c.adminId === user.id || c.admin?.email === user.email);
      setMyClub(foundClub);

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

  const handleRemoveMember = async (studentId) => {
    if(!window.confirm("Remove this member? They will lose access to member-only updates.")) return;
    try {
      await axios.delete(`${API_URL}/api/clubs/${myClub.id}/members/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(members.filter(m => m.student.id !== studentId));
      setMessage("Member removed successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove member");
    }
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
        <div className="bg-white p-1.5 rounded-full inline-flex gap-2 shadow-md border border-gray-100">
          <button 
            onClick={() => setViewMode('admin')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${viewMode === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FaCrown /> Manage Club
          </button>
          <button 
            onClick={() => setViewMode('student')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${viewMode === 'student' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FaUserGraduate /> My Student Profile
          </button>
        </div>
      </div>

      {message && <div className="fixed top-20 right-5 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2"><FaCrown className="text-yellow-400"/> {message}</div>}

      {/* 2. DUAL VIEW CONTENT */}
      {viewMode === 'student' ? (
        <StudentDash />
      ) : (
        <div className="animate-in fade-in duration-500 space-y-8">
          
          {/* A. DASHBOARD HEADER (Colorful Gradient) */}
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              
              {/* Club Identity */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/20">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{myClub?.name || "Loading..."}</h1>
                    <button onClick={() => setEditingClub(myClub)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition backdrop-blur-sm">
                      <FaCog className="text-sm" />
                    </button>
                  </div>
                  <p className="text-indigo-200 mt-1 max-w-lg line-clamp-1">{myClub?.description}</p>
                </div>
              </div>

              {/* Quick Stats Tiles */}
              <div className="flex gap-4 w-full md:w-auto">
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex-1 md:flex-none min-w-[120px] text-center">
                   <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Members</p>
                   <p className="text-2xl font-black">{members.length}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex-1 md:flex-none min-w-[120px] text-center">
                   <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Events</p>
                   <p className="text-2xl font-black">{events.length}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex-1 md:flex-none min-w-[120px] text-center hidden sm:block">
                   <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Avg. Attend</p>
                   <p className="text-2xl font-black">{avgAttendance}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* B. MAIN CONTENT AREA (Pill Tabs) */}
          <div>
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setAdminTab('events')}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                  adminTab === 'events' 
                  ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-50 transform scale-105' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <FaCalendarAlt /> Managed Events
              </button>
              <button 
                onClick={() => setAdminTab('members')}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                  adminTab === 'members' 
                  ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-50 transform scale-105' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <FaAddressBook /> Member Directory
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{members.length}</span>
              </button>
            </div>

            {/* TAB 1: EVENTS LIST */}
            {adminTab === 'events' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Your Events</h2>
                  <button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition font-bold shadow-lg flex items-center gap-2 text-sm transform active:scale-95"
                  >
                    {showCreateForm ? <FaTimes /> : <FaPlus />}
                    {showCreateForm ? 'Close Form' : 'Create Event'}
                  </button>
                </div>

                {showCreateForm && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl mb-8 ring-4 ring-gray-50">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                      <h3 className="font-bold text-gray-800 text-lg">Create New Event</h3>
                      <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-red-500 transition"><FaTimes/></button>
                    </div>
                    <CreateEventForm token={token} onEventCreated={handleNewEvent} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No events found.</p>
                      <button onClick={() => setShowCreateForm(true)} className="text-indigo-600 font-bold hover:underline mt-2">Create your first event</button>
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
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  
                  {/* Search Bar */}
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input 
                        type="text" 
                        placeholder="Search members by name or email..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-bold text-gray-900">{members.length}</span>
                    </div>
                  </div>

                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      <FaUsers className="mx-auto text-4xl text-gray-200 mb-3" />
                      {members.length === 0 ? "No members yet. Invite students to join!" : "No members found matching your search."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-indigo-50/50 text-xs uppercase font-bold text-indigo-900">
                          <tr>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Joined Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredMembers.map((member) => (
                            <tr key={member.student.id} className="hover:bg-indigo-50/30 transition duration-150 group">
                              <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm shadow-sm">
                                  {member.student.name.charAt(0).toUpperCase()}
                                </div>
                                {member.student.name}
                              </td>
                              <td className="px-6 py-4 text-gray-500">{member.student.email}</td>
                              <td className="px-6 py-4">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                    {new Date(member.joinedAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleRemoveMember(member.student.id)}
                                  className="text-gray-400 hover:text-red-600 font-medium text-xs border border-transparent hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded transition flex items-center gap-1 ml-auto group-hover:visible"
                                  title="Remove Member"
                                >
                                  <FaTrash /> Remove
                                </button>
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