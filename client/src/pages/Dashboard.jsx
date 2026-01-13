import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

// Components
import EventCard from '../components/EventCard';
import CreateEventForm from '../components/CreateEventForm';
import CreateClubForm from '../components/CreateClubForm';

const Dashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // State for different data sets
  const [managedEvents, setManagedEvents] = useState([]); // Events I created (Admin)
  const [myTickets, setMyTickets] = useState([]);         // Events I joined (Student)
  const [clubsList, setClubsList] = useState([]);         // All Clubs (Super Admin)
  
  const [message, setMessage] = useState('');

  // 1. Fetch Data based on Role
  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (user.role === 'SUPER_ADMIN') {
          const res = await axios.get('http://localhost:5000/api/clubs', config);
          setClubsList(res.data);
        } 
        else if (user.role === 'CLUB_ADMIN') {
          // ADMIN: Fetch BOTH Managed Events AND My Tickets
          const [managedRes, ticketsRes] = await Promise.all([
            axios.get('http://localhost:5000/api/events/my-events', config),
            axios.get('http://localhost:5000/api/events/my-registrations', config)
          ]);
          setManagedEvents(managedRes.data);
          setMyTickets(ticketsRes.data);
        } 
        else {
          // STUDENT: Just Tickets
          const res = await axios.get('http://localhost:5000/api/events/my-registrations', config);
          setMyTickets(res.data);
        }
      } catch (err) { console.error("Fetch error", err); }
    };
    fetchData();
  }, [user, token, navigate]);

  // Handlers
  const handleNewEvent = (newEvent) => { setManagedEvents([newEvent, ...managedEvents]); };
  const handleNewClub = (newClub) => { setClubsList([...clubsList, newClub]); };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setManagedEvents(managedEvents.filter(item => item.id !== eventId));
      setMessage("Event deleted.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to delete."); }
  };

  const handleCancelTicket = async (eventId) => {
    if (!window.confirm("Cancel this ticket?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTickets(myTickets.filter(item => item.event.id !== eventId));
      setMessage("Ticket Cancelled.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert("Failed to cancel."); }
  };

  if (!user) return null;

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">
             {user.role === 'SUPER_ADMIN' ? 'Super Admin HQ' : 'Dashboard'}
           </h1>
           <p className="text-gray-600">Welcome, <span className="font-semibold">{user.name}</span> ({user.role})</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
      </div>

      {message && <div className="fixed bottom-5 right-5 bg-blue-600 text-white px-6 py-3 rounded shadow-lg animate-bounce">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: FORMS & STATS */}
        <div className="h-fit space-y-6">
          {user.role === 'SUPER_ADMIN' && <CreateClubForm token={token} onClubCreated={handleNewClub} />}
          {user.role === 'CLUB_ADMIN' && <CreateEventForm token={token} onEventCreated={handleNewEvent} />}
          
          {/* Profile Card for Everyone */}
          <div className="bg-white p-6 rounded shadow-lg border">
            <h2 className="text-xl font-bold mb-4">My Profile</h2>
            <div className="p-4 bg-blue-50 rounded border border-blue-100 text-center">
              <p className="text-3xl font-bold text-blue-600 mb-1">{myTickets.length}</p>
              <p className="text-sm text-blue-800">Events Joined</p>
            </div>
          </div>
        </div>

        {/* RIGHT: DATA LISTS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. SUPER ADMIN VIEW */}
          {user.role === 'SUPER_ADMIN' && (
            <div>
               <h2 className="text-2xl font-bold text-gray-800 mb-4">All Active Clubs</h2>
               {clubsList.map((club, i) => (
                  <div key={i} className="bg-white p-5 rounded shadow border-l-4 border-purple-500 mb-4">
                    <h3 className="text-xl font-bold">{club.name}</h3>
                    <p className="text-gray-600">{club.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Admin: {club.admin?.name}</p>
                  </div>
               ))}
            </div>
          )}

          {/* 2. CLUB ADMIN MANAGED EVENTS */}
          {user.role === 'CLUB_ADMIN' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Events You Manage</h2>
              {managedEvents.length === 0 ? <p className="text-gray-500">No events created yet.</p> : 
                managedEvents.map(event => (
                  <EventCard key={event.id} event={event} token={token} onDelete={handleDeleteEvent} />
                ))
              }
            </div>
          )}

          {/* 3. MY TICKETS (For Students AND Club Admins) */}
          {(user.role === 'STUDENT' || user.role === 'CLUB_ADMIN') && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {user.role === 'CLUB_ADMIN' ? "Events You Are Attending" : "My Tickets"}
              </h2>
              {myTickets.length === 0 ? <p className="text-gray-500 italic">You haven't joined any events yet.</p> : 
                myTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white p-5 rounded shadow border-l-4 border-green-500 flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{ticket.event.title}</h3>
                      <p className="text-sm text-gray-500">{new Date(ticket.event.date).toLocaleString()} @ {ticket.event.location}</p>
                      {ticket.event.club && <p className="text-xs text-blue-600 font-bold mt-1">Hosted by: {ticket.event.club.name}</p>}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Attending</span>
                      <button onClick={() => handleCancelTicket(ticket.event.id)} className="text-xs text-red-500 hover:text-red-700 underline font-semibold">Cancel Ticket</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;