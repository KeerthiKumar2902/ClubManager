import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import RequestClubModal from '../../components/RequestClubModal';
import EditProfileModal from '../../components/EditProfileModal';

// ICONS
import { 
  FaTicketAlt, 
  FaCalendarCheck, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPlus, 
  FaUserEdit, 
  FaUsers, 
  FaExternalLinkAlt,
  FaNewspaper, 
  FaBell,
  FaBullhorn // <--- THIS WAS MISSING
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex bg-white p-1.5 rounded-xl border shadow-sm gap-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'tickets' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FaTicketAlt /> Tickets
          </button>
          <button 
            onClick={() => setActiveTab('clubs')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'clubs' ? 'bg-purple-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FaUsers /> Communities
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'news' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FaNewspaper /> News Feed
            {newsFeed.length > 0 && <span className="bg-white text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full">{newsFeed.length}</span>}
          </button>
        </div>
        
        <div className="flex gap-3">
           <button onClick={() => setShowProfileModal(true)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"><FaUserEdit /> Edit Profile</button>
           {user.role === 'STUDENT' && <button onClick={() => setIsRequestModalOpen(true)} className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition font-bold flex items-center gap-2 shadow-lg"><FaPlus /> Start a Club</button>}
        </div>
      </div>

      {message && <div className="fixed top-5 right-5 bg-black text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">{message}</div>}

      {/* --- TAB 1: TICKETS --- */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-2">
          {myTickets.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <FaTicketAlt className="mx-auto text-6xl text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">No active tickets</h3>
              <Link to="/" className="text-purple-600 font-bold hover:underline">Browse Events →</Link>
            </div>
          ) : (
            myTickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden hover:shadow-md transition">
                <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white flex flex-col justify-between">
                  <div className="font-bold opacity-90 text-sm tracking-wider uppercase">{ticket.event.club?.name || 'Event Pass'}</div>
                  <h3 className="text-xl font-bold truncate">{ticket.event.title}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600"><FaCalendarCheck className="text-indigo-500" /><span className="font-medium">{new Date(ticket.event.date).toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><FaClock className="text-indigo-500" /><span className="font-medium">{new Date(ticket.event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><FaMapMarkerAlt className="text-indigo-500" /><span className="font-medium truncate">{ticket.event.location}</span></div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Admit One</span>
                    <button onClick={() => handleCancelTicket(ticket.event.id)} className="text-red-500 text-xs font-bold hover:underline">Cancel</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 2: CLUBS --- */}
      {activeTab === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-2">
          {myClubs.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <FaUsers className="mx-auto text-6xl text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">You haven't joined any clubs</h3>
              <Link to="/clubs" className="text-purple-600 font-bold hover:underline">Explore Clubs →</Link>
            </div>
          ) : (
            myClubs.map(club => (
              <div key={club.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-2xl border border-purple-100">🏛️</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{club.name}</h3>
                    <p className="text-xs text-gray-500">Joined: {new Date(club.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-6 flex-1">{club.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link to={`/clubs/${club.id}`} className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">View Page <FaExternalLinkAlt className="text-xs" /></Link>
                  <button onClick={() => handleLeaveClub(club.id)} className="text-red-400 text-xs font-bold hover:text-red-600">Leave</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 3: NEWS FEED (NEW) --- */}
      {activeTab === 'news' && (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {newsFeed.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <FaBell className="mx-auto text-6xl text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">No recent updates</h3>
              <p className="text-gray-500">Join more clubs to see their announcements here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {newsFeed.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-lg">
                        <FaBullhorn /> 
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">From: <span className="text-purple-600 font-bold">{item.club.name}</span></p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{item.message}</p>
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