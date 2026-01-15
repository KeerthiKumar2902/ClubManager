import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import CreateClubForm from '../../components/CreateClubForm';
import EditClubModal from '../../components/EditClubModal';
import StudentDash from './StudentDash'; // <--- 1. IMPORT STUDENT DASH

// ICONS
import { 
  FaBuilding, 
  FaClipboardList, 
  FaCheckCircle, 
  FaPlus, 
  FaSearch, 
  FaTrash, 
  FaEdit,
  FaTicketAlt // <--- NEW ICON
} from 'react-icons/fa';
import { FiCheck, FiX, FiActivity } from 'react-icons/fi';

const SuperAdminDash = () => {
  const { token, user } = useAuthStore();
  
  // Data State
  const [clubsList, setClubsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  
  // UI State
  const [editingClub, setEditingClub] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests' | 'clubs' | 'tickets'
  const [showCreateForm, setShowCreateForm] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // --- 1. Fetch Data ---
  useEffect(() => {
    fetchData();
  }, [token, API_URL]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [clubsRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/api/clubs`, config),
        axios.get(`${API_URL}/api/clubs/requests`, config)
      ]);
      setClubsList(clubsRes.data);
      setRequestsList(requestsRes.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  // --- 2. Handlers ---
  const handleNewClub = (newClub) => {
    setClubsList([...clubsList, newClub]);
    setShowCreateForm(false);
    setMessage("Club created successfully!");
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm("WARNING: This will delete the Club, all its Events, and downgrade the Admin. Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/api/clubs/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClubsList(clubsList.filter(club => club.id !== clubId));
      setMessage("Club deleted successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to delete club."); }
  };

  const handleUpdateClub = () => window.location.reload(); 

  const handleProcessRequest = async (requestId, status) => {
    if(!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await axios.put(`${API_URL}/api/clubs/requests/${requestId}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestsList(requestsList.filter(r => r.id !== requestId));
      
      if(status === 'APPROVED') {
        setMessage("Request Approved! Refreshing...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage("Request Rejected.");
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) { alert("Failed to process request"); }
  };

  // --- 3. Render Helper Components ---
  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Command Center</h1>
          <p className="text-gray-500">Welcome back, {user.name}</p>
        </div>
        
        {/* VIEW TOGGLES */}
        <div className="bg-white p-1 rounded-lg border shadow-sm inline-flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: <FiActivity /> },
            { id: 'requests', label: `Requests (${requestsList.length})`, icon: <FaClipboardList /> },
            { id: 'clubs', label: 'Active Clubs', icon: <FaBuilding /> },
            { id: 'tickets', label: 'My Tickets', icon: <FaTicketAlt /> } // <--- NEW TAB
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                activeTab === tab.id 
                ? 'bg-gray-900 text-white shadow' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {message && (
        <div className="fixed top-5 right-5 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <FaCheckCircle className="text-green-400 text-xl" />
          {message}
        </div>
      )}

      {/* --- VIEW 1: OVERVIEW (Stats) --- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Active Clubs" 
              value={clubsList.length} 
              icon={<FaBuilding />} 
              colorClass="bg-purple-100 text-purple-600" 
            />
            <StatCard 
              title="Pending Requests" 
              value={requestsList.length} 
              icon={<FaClipboardList />} 
              colorClass="bg-orange-100 text-orange-600" 
            />
            <StatCard 
              title="System Status" 
              value="Online" 
              icon={<FaCheckCircle />} 
              colorClass="bg-green-100 text-green-600" 
            />
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <FaPlus className="text-purple-400" /> Need to add a club manually?
              </h2>
              <p className="text-gray-400">Bypass the petition process and assign an admin directly.</p>
            </div>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="mt-4 md:mt-0 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-md flex items-center gap-2"
            >
              {showCreateForm ? <FiX /> : <FaPlus />}
              {showCreateForm ? 'Close Form' : 'Create New Club'}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white p-6 rounded-xl border shadow-sm animate-in slide-in-from-top-4">
              <CreateClubForm token={token} onClubCreated={handleNewClub} />
            </div>
          )}
        </div>
      )}

      {/* --- VIEW 2: REQUESTS INBOX --- */}
      {activeTab === 'requests' && (
        <div className="animate-in fade-in duration-500">
           <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
             <FaClipboardList className="text-orange-500" /> Pending Petitions
           </h2>
           
           {requestsList.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 flex flex-col items-center">
               <FaCheckCircle className="text-4xl text-gray-200 mb-4" />
               No pending requests. All caught up!
             </div>
           ) : (
             <div className="space-y-4">
               {requestsList.map((req) => (
                 <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                         Petition
                       </span>
                       <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                     </div>
                     <p className="text-gray-600 italic mb-2 pl-2 border-l-2 border-gray-200">"{req.description}"</p>
                     <div className="text-sm text-gray-500 flex items-center gap-4 mt-3">
                       <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">👤 {req.student.name}</span>
                       <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">📧 {req.student.email}</span>
                     </div>
                   </div>
                   
                   <div className="flex gap-3 w-full md:w-auto">
                     <button 
                       onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                       className="flex-1 md:flex-none bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 font-medium transition flex items-center gap-2"
                     >
                       <FiCheck /> Approve
                     </button>
                     <button 
                       onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                       className="flex-1 md:flex-none bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium transition flex items-center gap-2"
                     >
                       <FiX /> Reject
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* --- VIEW 3: CLUBS GRID --- */}
      {activeTab === 'clubs' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-purple-600" /> Active Clubs Directory
            </h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search clubs..." 
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubsList.map((club) => (
              <div key={club.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 flex flex-col">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                <div className="p-6 flex-1 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl text-gray-400">
                      <FaBuilding />
                    </div>
                    {/* Hover Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => setEditingClub(club)} className="p-2 hover:bg-blue-50 rounded-full text-blue-600 border border-transparent hover:border-blue-100 transition">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteClub(club.id)} className="p-2 hover:bg-red-50 rounded-full text-red-600 border border-transparent hover:border-red-100 transition">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{club.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{club.description}</p>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded font-medium">Admin</span>
                    <span className="truncate max-w-[150px] font-medium">{club.admin?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- VIEW 4: MY TICKETS (NEW) --- */}
      {activeTab === 'tickets' && (
        <div className="animate-in fade-in duration-500">
          <StudentDash />
        </div>
      )}

      {/* MODAL */}
      {editingClub && (
        <EditClubModal 
          club={editingClub} 
          token={token} 
          onClose={() => setEditingClub(null)} 
          onUpdate={handleUpdateClub} 
        />
      )}
    </div>
  );
};

export default SuperAdminDash;