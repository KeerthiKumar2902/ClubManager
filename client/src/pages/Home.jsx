import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [myRegistrationIds, setMyRegistrationIds] = useState(new Set()); // Store IDs of events I joined
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  // 1. Fetch Data (Events + My Registrations)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // A. Always fetch all events
        const eventsRes = await axios.get('http://localhost:5000/api/events');
        setEvents(eventsRes.data);

        // B. If logged in, fetch MY registrations to see what I already joined
        if (user && token) {
          const myRes = await axios.get('http://localhost:5000/api/events/my-registrations', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Extract just the Event IDs into a Set for fast lookup
          const myIds = new Set(myRes.data.map(reg => reg.eventId));
          setMyRegistrationIds(myIds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]); // Re-run if user logs in/out

  // 2. Handle Register Logic (With Live State Updates)
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

      // --- CRITICAL FIX: Update State Immediately (Optimistic UI) ---
      
      // 1. Mark as registered locally
      setMyRegistrationIds(prev => new Set(prev).add(eventId));

      // 2. Update the specific event's count locally
      setEvents(prevEvents => prevEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            _count: {
              ...event._count,
              registrations: (event._count.registrations || 0) + 1 // Add 1 to count
            }
          };
        }
        return event;
      }));

    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  // 3. Filter Events
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-4 text-center relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Discover Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Life</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light">
            Your gateway to clubs, workshops, and hackathons. Never miss a moment.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <input 
                type="text"
                placeholder="Find your next event..."
                className="w-full py-4 px-8 rounded-full bg-white text-gray-900 shadow-2xl focus:outline-none focus:ring-0 text-lg placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-3 top-2.5 bg-blue-600 p-2 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- EVENTS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center mb-8">
          <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">No events found matching "{searchTerm}"</p>
            <button onClick={() => setSearchTerm('')} className="mt-4 text-blue-600 font-semibold hover:underline">Clear Search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => {
               
               // --- LOGIC: Calculate Status ---
               const isPast = new Date(event.date) < new Date();
               const taken = event._count?.registrations || 0;
               const capacity = event.capacity || 50; // Default capacity 50
               const isFull = taken >= capacity;
               const spotsLeft = capacity - taken;
               
               // Check if I am already registered
               const isRegistered = myRegistrationIds.has(event.id);

               return (
                <div key={event.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                  
                  {/* Card Header Gradient */}
                  <div className={`h-32 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex flex-col justify-center relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                    <h3 className="text-white text-2xl font-bold relative z-10 leading-tight">
                      {event.title}
                    </h3>
                    <span className="text-blue-100 text-sm font-medium mt-1 relative z-10 flex items-center">
                      Hosted by {event.club.name}
                    </span>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    {/* Meta Info */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Date</span>
                        <span className="text-gray-700 font-semibold">
                          {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      <div className="text-right">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Location</span>
                         <p className="text-gray-700 font-semibold truncate max-w-[120px]">{event.location}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
                      {event.description}
                    </p>
                    
                    {/* --- BUTTON LOGIC (Order Matters!) --- */}
                    <div className="mt-auto">
                      {isPast ? (
                        // 1. PAST
                        <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 px-4 rounded-xl cursor-not-allowed border border-gray-200">
                          Event Ended
                        </button>
                      
                      ) : isRegistered ? (
                        // 2. ALREADY REGISTERED (Green & Disabled)
                        <button disabled className="w-full bg-green-50 text-green-600 font-bold py-3 px-4 rounded-xl cursor-not-allowed border border-green-200 flex justify-center items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Registered
                        </button>

                      ) : isFull ? (
                        // 3. SOLD OUT (Red & Disabled)
                        <button disabled className="w-full bg-red-50 text-red-500 font-bold py-3 px-4 rounded-xl cursor-not-allowed border border-red-100 flex justify-center items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Sold Out
                        </button>

                      ) : (
                        // 4. ACTIVE (Black)
                        <button 
                          onClick={() => handleRegister(event.id)}
                          className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-black transition shadow-lg active:scale-95 flex justify-between items-center group-hover:bg-blue-600"
                        >
                          <span>{user ? "Register Now" : "Login to Join"}</span>
                          <span className="bg-gray-800 group-hover:bg-blue-500 text-xs py-1 px-2 rounded text-gray-200 transition-colors">
                            {spotsLeft} spots left
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;