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
  FaCrown, FaUserGraduate, FaPlus, FaCalendarAlt, FaUsers, 
  FaCog, FaTimes, FaAddressBook, FaSearch, FaUserCircle, 
  FaTrash, FaBullhorn, FaPaperPlane 
} from 'react-icons/fa';

const ClubAdminDash = () => {
  const { token, user } = useAuthStore();
  
  // Data
  const [myClub, setMyClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]); 
  
  // UI State
  const [viewMode, setViewMode] = useState('admin');
  const [adminTab, setAdminTab] = useState('events'); 
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingClub, setEditingClub] = useState(null);
  const [managingEvent, setManagingEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });

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
        } catch (err) { console.error("Members error", err); }

        try {
          const annRes = await axios.get(`${API_URL}/api/clubs/${foundClub.id}/announcements`, config);
          setAnnouncements(annRes.data);
        } catch (err) { console.error("Announcements error", err); }
      }

    } catch (err) { console.error("Data load failed", err); }
  };

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
    if(!window.confirm("Remove this member?")) return;
    try {
      await axios.delete(`${API_URL}/api/clubs/${myClub.id}/members/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(members.filter(m => m.student.id !== studentId));
      setMessage("Member removed successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to remove member"); }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if(!myClub) return;
    try {
      const res = await axios.post(`${API_URL}/api/clubs/${myClub.id}/announcements`, newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements([res.data, ...announcements]); 
      setNewAnnouncement({ title: '', message: '' }); 
      setMessage("Announcement posted!");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert("Failed to post announcement");
    }
  };

  const totalAttendees = events.reduce((acc, curr) => acc + (curr._count?.registrations || 0), 0);
  const filteredMembers = members.filter(m => m.student.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen font-sans bg-gray-50">
      
      {/* 1. TOP NAV SWITCHER */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-full inline-flex gap-1 shadow-sm border border-gray-100 max-w-full overflow-x-auto">
          <button onClick={() => setViewMode('admin')} className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition flex items-center gap-2 ${viewMode === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <FaCrown /> Manage Club
          </button>
          <button onClick={() => setViewMode('student')} className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition flex items-center gap-2 ${viewMode === 'student' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <FaUserGraduate /> Student Profile
          </button>
        </div>
      </div>

      {message && <div className="fixed top-20 right-5 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2"><FaCrown className="text-yellow-400"/> {message}</div>}

      {viewMode === 'student' ? <StudentDash /> : (
        <div className="animate-in fade-in duration-500 space-y-8">
          
          {/* A. DASHBOARD HEADER (UPDATED WITH IMAGES) */}
          <div className="rounded-2xl shadow-xl overflow-hidden relative bg-gray-900 text-white min-h-[250px] flex flex-col justify-end">
            
            {/* Banner Background */}
            <div className="absolute inset-0">
                {myClub?.bannerUrl ? (
                    <img src={myClub.bannerUrl} className="w-full h-full object-cover opacity-60" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
            </div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full md:w-auto">
                
                {/* Logo */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-2xl shrink-0">
                    {myClub?.logoUrl ? (
                        <img src={myClub.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                        <span className="text-4xl">🏛️</span>
                    )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">{myClub?.name || "Loading..."}</h1>
                    <button onClick={() => setEditingClub(myClub)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition backdrop-blur-sm"><FaCog className="text-sm" /></button>
                  </div>
                  <p className="text-gray-300 mt-1 max-w-lg line-clamp-2 md:line-clamp-1 drop-shadow-sm text-sm md:text-base">{myClub?.description}</p>
                </div>
              </div>

              {/* Stats Tiles */}
              <div className="flex gap-3 w-full md:w-auto">
                 <div className="bg-black/40 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 flex-1 min-w-[100px] text-center">
                   <p className="text-indigo-200 text-[10px] md:text-xs font-bold uppercase mb-1">Members</p>
                   <p className="text-xl md:text-2xl font-black">{members.length}</p>
                 </div>
                 <div className="bg-black/40 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 flex-1 min-w-[100px] text-center">
                   <p className="text-indigo-200 text-[10px] md:text-xs font-bold uppercase mb-1">Updates</p>
                   <p className="text-xl md:text-2xl font-black">{announcements.length}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* B. MAIN CONTENT AREA */}
          <div>
            <div className="flex gap-3 md:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setAdminTab('events')} className={`px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${adminTab === 'events' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-50 transform scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <FaCalendarAlt /> Events
              </button>
              <button onClick={() => setAdminTab('members')} className={`px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${adminTab === 'members' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-50 transform scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <FaAddressBook /> Members <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">{members.length}</span>
              </button>
              <button onClick={() => setAdminTab('announcements')} className={`px-4 md:px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${adminTab === 'announcements' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-50 transform scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <FaBullhorn /> Announcements
              </button>
            </div>

            {/* TAB 1: EVENTS LIST */}
            {adminTab === 'events' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Your Events</h2>
                  <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-black text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-gray-800 transition font-bold shadow-lg flex items-center gap-2 text-xs md:text-sm transform active:scale-95">
                    {showCreateForm ? <FaTimes /> : <FaPlus />} {showCreateForm ? 'Close' : 'Create'}
                  </button>
                </div>
                {showCreateForm && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl mb-8 ring-4 ring-gray-50">
                    <CreateEventForm token={token} onEventCreated={handleNewEvent} />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.length === 0 ? <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">No events found.</div> : 
                    events.map(event => <EventCard key={event.id} event={event} token={token} isOwner={true} onDelete={handleDeleteEvent} onEdit={(ev) => setEditingEvent(ev)} onManage={(ev) => setManagingEvent(ev)} />)
                  }
                </div>
              </div>
            )}

            {/* TAB 2: MEMBERS LIST */}
            {adminTab === 'members' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                    <FaSearch className="text-gray-400" />
                    <input type="text" placeholder="Search members..." className="w-full bg-transparent outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-indigo-50/50 text-xs uppercase font-bold text-indigo-900">
                        <tr><th className="px-6 py-4">Student</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Joined</th><th className="px-6 py-4 text-right">Action</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMembers.map((m) => (
                          <tr key={m.student.id} className="hover:bg-indigo-50/30 transition">
                            <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3"><FaUserCircle className="text-purple-300 text-xl"/> {m.student.name}</td>
                            <td className="px-6 py-4">{m.student.email}</td>
                            <td className="px-6 py-4">{new Date(m.joinedAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right"><button onClick={() => handleRemoveMember(m.student.id)} className="text-red-500 hover:underline text-xs font-bold">Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ANNOUNCEMENTS */}
            {adminTab === 'announcements' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FaBullhorn className="text-indigo-500"/> New Announcement</h3>
                    <form onSubmit={handlePostAnnouncement} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                        <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" placeholder="e.g. Meeting Rescheduled" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                        <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition h-32" placeholder="Type your message..." value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})} required />
                      </div>
                      <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg"><FaPaperPlane /> Post Update</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Sent History</h3>
                  {announcements.length === 0 ? <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">No updates sent yet.</div> : 
                    announcements.map((ann) => (
                      <div key={ann.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{ann.title}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium border border-gray-200">{new Date(ann.date).toLocaleDateString()} • {new Date(ann.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                      </div>
                    ))
                  }
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