import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { FaUserPlus, FaCheckCircle, FaUsers, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const ClubProfile = () => {
  const { id } = useParams();
  const { user, token } = useAuthStore();
  
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/clubs/${id}`);
        setClub(res.data);
        
        // If logged in, we could theoretically check membership here if the API supported it
        // For now, we assume false until they click join (or we fetch "my-memberships")
      } catch (err) {
        console.error("Failed to load club");
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id, API_URL]);

  const handleJoin = async () => {
    if (!user) return alert("Please login to join!");
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/api/clubs/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsMember(true);
      alert("Success! You are now a member.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading Club...</div>;
  if (!club) return <div className="p-20 text-center">Club not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO HEADER (Updated with Visuals) */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        
        {/* A. Large Banner */}
        <div className="h-48 md:h-80 bg-gray-900 overflow-hidden relative">
          {club.bannerUrl ? (
            <img src={club.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 to-indigo-900"></div>
          )}
          {/* Overlay for text readability if needed, currently clean */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-8 gap-6">
            
            {/* B. Club Logo */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 z-10">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-5xl">🏛️</div>
              )}
            </div>

            {/* C. Club Info */}
            <div className="text-center md:text-left flex-1 pb-2 z-10">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 drop-shadow-sm md:text-white md:drop-shadow-md">
                {club.name}
              </h1>
              <p className="text-lg text-gray-600 md:text-gray-100 max-w-2xl leading-relaxed line-clamp-2 md:drop-shadow-md">
                {club.description}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-gray-600 mt-4">
                <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200 flex items-center gap-2">
                  <FaUsers /> {club._count?.members || 0} Members
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  Admin: {club.admin?.name || "Unknown"}
                </span>
              </div>
            </div>

            {/* D. Action Button */}
            <div className="mb-2 z-10">
              <button 
                onClick={handleJoin}
                disabled={isMember || actionLoading}
                className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2 ${
                  isMember 
                  ? 'bg-green-500 text-white cursor-default shadow-green-500/30' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/30'
                }`}
              >
                {actionLoading ? 'Processing...' : isMember ? <><FaCheckCircle /> Joined</> : <><FaUserPlus /> Join Club</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" /> Upcoming Events
          </h2>
          
          {club.events && club.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {club.events.map(event => (
                <div key={event.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition bg-white flex flex-col">
                  {/* Event Image Fallback logic handled in backend or just generic here if no event image passed yet */}
                  <div className="h-32 bg-gray-100 relative overflow-hidden">
                     {event.imageUrl ? (
                        <img src={event.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="" />
                     ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                     )}
                     <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                        {new Date(event.date).toLocaleDateString()}
                     </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-purple-600 transition">{event.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{event.description}</p>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><FaMapMarkerAlt /> {event.location}</span>
                      {/* Note: Registering usually happens on Home or Dashboard, but could be added here */}
                      <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-lg">
                        View
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
              <p className="text-xl font-medium mb-2">No upcoming events</p>
              <p className="text-sm">Join the club to get notified when new events drop!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;