import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import useAuthStore from '../store/authStore';
import { FaCalendarAlt, FaSearch, FaArrowRight } from 'react-icons/fa';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set()); // Store IDs of joined events
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token, user } = useAuthStore();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch All Public Events
        const eventsRes = await axios.get(`${API_URL}/api/events`);
        
        // 2. Filter & Sort (Hide past events, show soonest first)
        const now = new Date();
        const upcomingEvents = eventsRes.data
          .filter(event => new Date(event.date) >= now) 
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(upcomingEvents);

        // 3. If Logged In: Fetch User's Registrations to check status
        if (user && token) {
          try {
            const regRes = await axios.get(`${API_URL}/api/events/my-registrations`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Create a Set of Event IDs the user has joined
            const myIds = new Set(regRes.data.map(ticket => ticket.eventId));
            setRegisteredEventIds(myIds);
          } catch (err) {
            console.error("Failed to fetch registrations", err);
          }
        }

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, user, token]);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            University Event Hub
          </span>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Discover What's Happening <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">On Campus Today.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Don't miss out. Join clubs, attend workshops, and connect with your community.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!user && (
              <Link to="/register" className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-xl transform hover:-translate-y-1">
                Get Started
              </Link>
            )}
            <Link to="/clubs" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition flex items-center justify-center gap-2">
              Explore Clubs <FaArrowRight className="text-sm"/>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SEARCH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center border border-gray-100 max-w-2xl mx-auto">
          <div className="pl-4 text-gray-400 text-xl"><FaSearch /></div>
          <input 
            type="text" 
            placeholder="Search events..." 
            className="w-full p-4 outline-none text-gray-700 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. EVENTS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" /> Upcoming Events
          </h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredEvents.length} Active
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-xl text-gray-500 font-medium">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                token={token} 
                showRegister={true} 
                isOwner={false}
                // --- Pass Registration Status ---
                isRegistered={registeredEventIds.has(event.id)} 
                // --------------------------------
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;