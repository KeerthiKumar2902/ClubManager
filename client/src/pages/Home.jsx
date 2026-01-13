import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  // 1. Fetch Events on Load
  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 2. Handle Register Logic
  const handleRegister = async (eventId) => {
    if (!user) {
      alert("Please login to register!");
      navigate('/login');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Registration Successful! 🎉");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  // 3. Filter Events based on Search
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-gray-900 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Welcome to <span className="text-blue-500">UniClub</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          The central hub for all campus activities. Join clubs, attend workshops, and never miss an event again.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <input 
            type="text"
            placeholder="Search events or clubs..."
            className="w-full py-3 px-5 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* --- EVENTS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-8 border-blue-600 pl-4">
          Upcoming Events
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading amazing events...</p>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No events found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Card Header (Color based on ID to make it colorful) */}
                <div className={`h-32 flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-purple-600`}>
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-md">
                    {event.title}
                  </h3>
                </div>
                
                <div className="p-6">
                  {/* Meta Tags */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded uppercase">
                      {event.club.name}
                    </span>
                    <span className="text-sm text-gray-500 font-semibold">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2 h-12">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <span className="mr-2">📍</span> {event.location}
                  </div>

                  <button 
                    onClick={() => handleRegister(event.id)}
                    className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition shadow-lg active:scale-95"
                  >
                    {user ? "Register Now" : "Login to Join"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;