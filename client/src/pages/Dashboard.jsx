import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

// --- SUB-COMPONENT: Event Card (With Attendance Checkbox) ---
const EventCard = ({ event, token }) => {
  const [attendees, setAttendees] = useState([]);
  const [showAttendees, setShowAttendees] = useState(false);

  // 1. Fetch Attendees (Now includes 'attended' status)
  const fetchAttendees = async () => {
    if (showAttendees) { setShowAttendees(false); return; }
    try {
      const res = await axios.get(`http://localhost:5000/api/events/${event.id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendees(res.data);
      setShowAttendees(true);
    } catch (err) { alert("Failed to load attendees."); }
  };

  // 2. Toggle Attendance Status
  const toggleAttendance = async (studentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      // Call API
      await axios.put(`http://localhost:5000/api/events/${event.id}/attendance`, {
        studentId,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Local State (Optimistic UI)
      setAttendees(attendees.map(att => 
        att.studentId === studentId ? { ...att, attended: newStatus } : att
      ));

    } catch (err) {
      alert("Failed to mark attendance.");
    }
  };

  return (
    <div className="bg-white p-5 rounded shadow border-l-4 border-blue-500 mb-4 transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{event.title}</h3>
          <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</p>
        </div>
        <button 
          onClick={fetchAttendees}
          className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded border border-blue-200"
        >
          {showAttendees ? "Close List" : "Manage Attendance"}
        </button>
      </div>

      {/* The List of Students */}
      {showAttendees && (
        <div className="mt-4 bg-gray-50 p-3 rounded text-sm border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-700">Student List ({attendees.length})</h4>
            <span className="text-xs text-gray-500">Check to mark present</span>
          </div>

          {attendees.length === 0 ? (
            <p className="text-gray-500 italic">No registrations yet.</p>
          ) : (
            <ul className="space-y-2">
              {attendees.map(item => (
                <li key={item.studentId} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                  <div>
                    <p className="font-medium">{item.student.name}</p>
                    <p className="text-xs text-gray-400">{item.student.email}</p>
                  </div>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className={`text-xs font-bold ${item.attended ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.attended ? "PRESENT" : "ABSENT"}
                    </span>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={item.attended} 
                      onChange={() => toggleAttendance(item.studentId, item.attended)}
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT: Dashboard ---
const Dashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // State
  const [dataList, setDataList] = useState([]); 
  const [message, setMessage] = useState('');

  // Forms
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });
  const [clubForm, setClubForm] = useState({ clubName: '', clubDescription: '', adminName: '', adminEmail: '', adminPassword: '' });

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

  // 2. Handlers
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/events', eventForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataList([res.data, ...dataList]);
      setMessage('Event Created!');
      setEventForm({ title: '', description: '', date: '', location: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error creating event.'); }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/clubs', clubForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataList([...dataList, res.data.club]); 
      setMessage('Club & Admin Created!');
      setClubForm({ clubName: '', clubDescription: '', adminName: '', adminEmail: '', adminPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage(err.response?.data?.error || 'Error creating club.'); }
  };

  if (!user) return null;

  return (
    <div className="p-10 min-h-screen bg-gray-50">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: ACTION FORMS --- */}
        <div className="bg-white p-6 rounded shadow-lg border h-fit">
          {message && <p className="mb-4 text-sm text-green-600 font-bold bg-green-100 p-2 rounded text-center">{message}</p>}

          {/* SUPER ADMIN FORM */}
          {user.role === 'SUPER_ADMIN' && (
            <>
              <h2 className="text-xl font-bold mb-4">Launch New Club</h2>
              <form onSubmit={handleCreateClub} className="space-y-3">
                <input className="w-full border p-2 rounded" placeholder="Club Name" value={clubForm.clubName} onChange={e => setClubForm({...clubForm, clubName: e.target.value})} required />
                <input className="w-full border p-2 rounded" placeholder="Description" value={clubForm.clubDescription} onChange={e => setClubForm({...clubForm, clubDescription: e.target.value})} />
                <hr className="my-2 border-gray-200"/>
                <p className="text-xs font-bold text-gray-500 uppercase">Admin Details</p>
                <input className="w-full border p-2 rounded" placeholder="Admin Name" value={clubForm.adminName} onChange={e => setClubForm({...clubForm, adminName: e.target.value})} required />
                <input className="w-full border p-2 rounded" placeholder="Admin Email" value={clubForm.adminEmail} onChange={e => setClubForm({...clubForm, adminEmail: e.target.value})} required />
                <input className="w-full border p-2 rounded" type="password" placeholder="Admin Password" value={clubForm.adminPassword} onChange={e => setClubForm({...clubForm, adminPassword: e.target.value})} required />
                <button className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 transition">Create Club</button>
              </form>
            </>
          )}

          {/* CLUB ADMIN FORM */}
          {user.role === 'CLUB_ADMIN' && (
            <>
              <h2 className="text-xl font-bold mb-4">Create Event</h2>
              <form onSubmit={handleCreateEvent} className="space-y-3">
                <input className="w-full border p-2 rounded" placeholder="Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
                <input type="datetime-local" className="w-full border p-2 rounded" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} required />
                <input className="w-full border p-2 rounded" placeholder="Location" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} required />
                <textarea className="w-full border p-2 rounded" placeholder="Description" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} rows="3" />
                <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">Publish Event</button>
              </form>
            </>
          )}

          {/* STUDENT PROFILE */}
          {user.role === 'STUDENT' && (
            <div>
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
            
            // 2. PREPARE EVENT DATA (Admins get 'item', Students get 'item.event')
            const event = user.role === 'CLUB_ADMIN' ? item : item.event;

            // 3. CLUB ADMIN VIEW (Smart Card with Attendees)
            if (user.role === 'CLUB_ADMIN') {
              return <EventCard key={item.id} event={event} token={token} />;
            }

            // 4. STUDENT VIEW (Ticket Style)
            return (
              <div key={item.id || index} className="bg-white p-5 rounded shadow border-l-4 border-green-500 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()} @ {event.location}</p>
                  
                  {/* Show Host Club Name if available */}
                  {event.club && (
                    <p className="text-xs text-blue-600 font-bold mt-2">
                      Hosted by: {event.club.name}
                    </p>
                  )}
                </div>
                
                {/* Attending Badge */}
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                  Attending
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;