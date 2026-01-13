import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

// Import our new components
import EventCard from '../components/EventCard';
import CreateEventForm from '../components/CreateEventForm';
import CreateClubForm from '../components/CreateClubForm';

const Dashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Only one simple state list now!
  const [dataList, setDataList] = useState([]); 
  const [message, setMessage] = useState('');

  // 1. Fetch Data
  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        let url = '';
        if (user.role === 'SUPER_ADMIN') url = 'http://localhost:5000/api/clubs';
        else if (user.role === 'CLUB_ADMIN') url = 'http://localhost:5000/api/events/my-events';
        else url = 'http://localhost:5000/api/events/my-registrations';

        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setDataList(res.data);
      } catch (err) { console.error("Fetch error", err); }
    };
    fetchData();
  }, [user, token, navigate]);

  // 2. Handlers for Updating the List from Child Components
  const handleNewEvent = (newEvent) => {
    setDataList([newEvent, ...dataList]);
  };

  const handleNewClub = (newClub) => {
    setDataList([...dataList, newClub]);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataList(dataList.filter(item => item.id !== eventId));
      setMessage("Event deleted successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert(err.response?.data?.error || "Failed to delete event."); }
  };

  const handleCancelTicket = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataList(dataList.filter(item => item.event.id !== eventId));
      setMessage("Registration Cancelled.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to cancel."); }
  };

  if (!user) return null;

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">
             {user.role === 'SUPER_ADMIN' ? 'Super Admin HQ' : 
              user.role === 'CLUB_ADMIN' ? 'Club Admin Dashboard' : 'Student Dashboard'}
           </h1>
           <p className="text-gray-600">Logged in as: <span className="font-semibold">{user.name}</span></p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
      </div>

      {message && <div className="fixed bottom-5 right-5 bg-blue-600 text-white px-6 py-3 rounded shadow-lg animate-bounce">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: FORMS & PROFILES --- */}
        <div className="h-fit">
          {user.role === 'SUPER_ADMIN' && (
             <CreateClubForm token={token} onClubCreated={handleNewClub} />
          )}

          {user.role === 'CLUB_ADMIN' && (
             <CreateEventForm token={token} onEventCreated={handleNewEvent} />
          )}

          {user.role === 'STUDENT' && (
            <div className="bg-white p-6 rounded shadow-lg border">
              <h2 className="text-xl font-bold mb-4">My Profile</h2>
              <div className="p-4 bg-blue-50 rounded border border-blue-100 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-1">{dataList.length}</p>
                <p className="text-sm text-blue-800">Events Registered</p>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: DATA LIST --- */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {user.role === 'SUPER_ADMIN' ? 'All Active Clubs' : 
             user.role === 'CLUB_ADMIN' ? 'Your Managed Events' : 'My Event Tickets'}
          </h2>

          {dataList.length === 0 ? <p className="text-gray-500 italic">No items found.</p> : dataList.map((item, index) => {
            
            // 1. SUPER ADMIN VIEW (Clubs)
            if (user.role === 'SUPER_ADMIN') {
              return (
                <div key={item.id || index} className="bg-white p-5 rounded shadow border-l-4 border-purple-500 hover:shadow-md transition">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <span className="font-semibold mr-2">Admin:</span> {item.admin?.name || 'Unknown'}
                  </div>
                </div>
              );
            } 
            
            // 2. EVENT DATA
            const event = user.role === 'CLUB_ADMIN' ? item : item.event;

            // 3. CLUB ADMIN VIEW (Use our new Component!)
            if (user.role === 'CLUB_ADMIN') {
              return (
                <EventCard 
                  key={item.id} 
                  event={event} 
                  token={token} 
                  onDelete={handleDeleteEvent} 
                />
              );
            }

            // 4. STUDENT VIEW
            return (
              <div key={item.id || index} className="bg-white p-5 rounded shadow border-l-4 border-green-500 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()} @ {event.location}</p>
                  {event.club && <p className="text-xs text-blue-600 font-bold mt-2">Hosted by: {event.club.name}</p>}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Attending</span>
                  <button onClick={() => handleCancelTicket(event.id)} className="text-xs text-red-500 hover:text-red-700 underline font-semibold">Cancel Ticket</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;