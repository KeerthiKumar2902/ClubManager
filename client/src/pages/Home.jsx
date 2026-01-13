import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

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

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Upcoming Campus Events</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-32 bg-blue-600 flex items-center justify-center">
                <h2 className="text-white text-2xl font-bold px-4 text-center">{event.title}</h2>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                    {event.club.name}
                  </span>
                  <span className="text-sm text-gray-500 font-semibold">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 h-12 overflow-hidden">{event.description}</p>
                <p className="text-sm text-gray-500 mb-6 flex items-center">
                  📍 {event.location}
                </p>

                <button 
                  onClick={() => handleRegister(event.id)}
                  className="w-full bg-gray-900 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                >
                  {user ? "Register Now" : "Login to Register"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;