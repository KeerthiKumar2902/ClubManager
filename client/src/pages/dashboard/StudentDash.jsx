import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import RequestClubModal from '../../components/RequestClubModal';
import EditProfileModal from '../../components/EditProfileModal';

// ICONS
import { 
  FaTicketAlt, FaCalendarCheck, FaMapMarkerAlt, FaClock, FaPlus, 
  FaUserEdit, FaUsers, FaExternalLinkAlt, FaNewspaper, FaBell,
  FaBullhorn, FaSignOutAlt, FaChevronRight, FaCheckCircle 
} from 'react-icons/fa';

const StudentDash = () => {
  const { token, user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'clubs' | 'news'
  const [myTickets, setMyTickets] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]); 
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, [token, API_URL]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [ticketRes, clubRes, newsRes] = await Promise.all([
        axios.get(`${API_URL}/api/events/my-registrations`, config),
        axios.get(`${API_URL}/api/clubs/my-memberships`, config),
        axios.get(`${API_URL}/api/clubs/my-announcements`, config) 
      ]);

      setMyTickets(ticketRes.data);
      setMyClubs(clubRes.data);
      setNewsFeed(newsRes.data);

    } catch (err) { console.error(err); }
  };

  const handleCancelTicket = async (eventId) => {
    if (!window.confirm("Cancel this ticket?")) return;
    try {
      await axios.delete(`${API_URL}/api/events/${eventId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTickets(myTickets.filter(item => item.event.id !== eventId));
      setMessage("Ticket Cancelled.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to cancel."); }
  };

  const handleLeaveClub = async (clubId) => {
    if (!window.confirm("Leave this club?")) return;
    try {
      await axios.delete(`${API_URL}/api/clubs/${clubId}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyClubs(myClubs.filter(c => c.id !== clubId));
      setMessage("Left club successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to leave."); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
        
        {/* Tab Navigation */}
        <div className="flex bg-white p-1.5 rounded-full border shadow-sm w-full lg:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 lg:flex-none px-6 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'tickets' ? 'bg-black text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FaTicketAlt /> My Tickets
          </button>
          <button 
            onClick={() => setActiveTab('clubs')}
            className={`flex-1 lg:flex-none px-6 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'clubs' ? 'bg-purple-600 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FaUsers /> Communities
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`flex-1 lg:flex-none px-6 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'news' ? 'bg-orange-500 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FaNewspaper /> News Feed
            {newsFeed.length > 0 && <span className="ml-1 bg-white text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{newsFeed.length}</span>}
          </button>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 w-full lg:w-auto">
           <button onClick={() => setShowProfileModal(true)} className="flex-1 lg:flex-none px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold flex items-center justify-center gap-2 shadow-sm transition"><FaUserEdit /> Edit Profile</button>
           {user.role === 'STUDENT' && <button onClick={() => setIsRequestModalOpen(true)} className="flex-1 lg:flex-none bg-gradient-to-r from-black to-gray-800 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition font-bold flex items-center justify-center gap-2"><FaPlus /> Start a Club</button>}
        </div>
      </div>

      {message && <div className="fixed top-20 right-5 bg-black text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2"><FaCheckCircle className="text-green-400"/> {message}</div>}

      {/* --- TAB 1: TICKETS --- */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-500">
          {myTickets.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎟️</div>
              <h3 className="text-xl font-bold text-gray-900">No active tickets</h3>
              <p className="text-gray-500 mb-6">You haven't registered for any upcoming events.</p>
              <Link to="/" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">Browse Events</Link>
            </div>
          ) : (
            myTickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden hover:shadow-xl transition-all duration-300 group">
                
                {/* Event Image / Gradient Header */}
                <div className="h-32 relative overflow-hidden">
                    {ticket.event.imageUrl ? (
                        <img src={ticket.event.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Event" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white flex flex-col justify-between">
                            <div className="font-bold opacity-80 text-xs tracking-wider uppercase">{ticket.event.club?.name || 'Event Pass'}</div>
                            <h3 className="text-xl font-bold truncate">{ticket.event.title}</h3>
                        </div>
                    )}
                    {ticket.event.imageUrl && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-white text-lg font-bold truncate shadow-sm">{ticket.event.title}</h3>
                        </div>
                    )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-800 font-bold">
                            <FaCalendarCheck className="text-purple-600" /> 
                            {new Date(ticket.event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 font-bold bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs">
                            <FaClock /> 
                            {new Date(ticket.event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="truncate">{ticket.event.location}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-200">Confirmed</span>
                    <button onClick={() => handleCancelTicket(ticket.event.id)} className="text-red-500 text-xs font-bold hover:text-red-700 hover:underline transition">Cancel Ticket</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 2: COMMUNITIES (VISUAL UPGRADE) --- */}
      {activeTab === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
          {myClubs.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚀</div>
              <h3 className="text-xl font-bold text-gray-900">Join a Community</h3>
              <p className="text-gray-500 mb-6">You aren't a member of any clubs yet.</p>
              <Link to="/clubs" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">Explore Clubs</Link>
            </div>
          ) : (
            myClubs.map(club => (
              <div key={club.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                
                {/* Banner Header */}
                <div className="h-28 bg-gray-100 relative">
                    {club.bannerUrl ? (
                        <img src={club.bannerUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Banner" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                    )}
                    
                    {/* Floating Logo */}
                    <div className="absolute -bottom-6 left-6">
                        <div className="w-14 h-14 bg-white rounded-xl shadow-md border-4 border-white overflow-hidden flex items-center justify-center">
                            {club.logoUrl ? <img src={club.logoUrl} className="w-full h-full object-cover" alt="Logo"/> : <span className="text-2xl">🏛️</span>}
                        </div>
                    </div>
                </div>

                <div className="pt-8 px-6 pb-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition">{club.name}</h3>
                    
                    {/* Darker Member Since Badge */}
                    <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                        Since {new Date(club.joinedAt).getFullYear()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{club.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                    <Link to={`/clubs/${club.id}`} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                        View Page <FaExternalLinkAlt className="text-[10px]" />
                    </Link>
                    
                    {/* Explicit Leave Button with Text */}
                    <button 
                        onClick={() => handleLeaveClub(club.id)} 
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg text-xs font-bold transition flex items-center gap-2" 
                        title="Leave Club"
                    >
                        <FaSignOutAlt /> Leave
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 3: NEWS FEED --- */}
      {activeTab === 'news' && (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {newsFeed.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <FaBell className="mx-auto text-5xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
              <p className="text-gray-500">No new announcements from your communities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {newsFeed.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-lg shadow-inner">
                        <FaBullhorn /> 
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{item.title}</h4>
                        <Link to={`/clubs/${item.clubId}`} className="text-xs text-purple-600 font-bold hover:underline uppercase tracking-wide">
                            {item.club.name}
                        </Link>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="pl-12">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">{item.message}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <FaClock /> {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RequestClubModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
      {showProfileModal && <EditProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};

export default StudentDash;