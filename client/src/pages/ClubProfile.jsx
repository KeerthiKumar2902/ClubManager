import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import EventCard from '../components/EventCard';
import { FaUserPlus, FaCheckCircle, FaUsers } from 'react-icons/fa';

const ClubProfile = () => {
  const { id } = useParams();
  const { user, token } = useAuthStore();
  
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false); // We'll mock this or fetch real state later
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/clubs/${id}`);
        setClub(res.data);
        
        // TODO: In a real app, we check if user is member via API
        // For now, we rely on the button action response
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
      
      {/* 1. Hero Banner */}
      <div className="bg-gray-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 opacity-90"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-purple-500/50">
              Official Club
            </span>
            <h1 className="text-5xl font-black mb-4 tracking-tight">{club.name}</h1>
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">{club.description}</p>
            
            <div className="flex items-center gap-6 mt-8 text-sm font-medium text-gray-400">
              <span className="flex items-center gap-2">
                <FaUsers /> {club._count?.members || 0} Members
              </span>
              <span>•</span>
              <span>Admin: {club.admin?.name}</span>
            </div>
          </div>

          <button 
            onClick={handleJoin}
            disabled={isMember || actionLoading}
            className={`px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition transform hover:-translate-y-1 flex items-center gap-3 ${
              isMember 
              ? 'bg-green-500 text-white cursor-default' 
              : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            {actionLoading ? 'Processing...' : isMember ? <><FaCheckCircle /> Member</> : <><FaUserPlus /> Join Club</>}
          </button>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
            Upcoming Events
          </h2>
          
          {club.events && club.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {club.events.map(event => (
                <div key={event.id} className="border rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-xs text-gray-400">{event.location}</span>
                    <button className="text-purple-600 text-sm font-bold hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed text-gray-500">
              No upcoming events scheduled. Join the club to get notified!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;