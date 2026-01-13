import React, { useState } from 'react';
import axios from 'axios';

const EventCard = ({ event, token, onDelete, onEdit }) => {
  const [attendees, setAttendees] = useState([]);
  const [showAttendees, setShowAttendees] = useState(false);

  // Stats Logic
  const capacity = event.capacity || 50;
  const registeredCount = event._count?.registrations || 0;
  const seatsLeft = capacity - registeredCount;
  const percentage = Math.min((registeredCount / capacity) * 100, 100);

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

  const toggleAttendance = async (studentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axios.put(`http://localhost:5000/api/events/${event.id}/attendance`, {
        studentId, status: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      setAttendees(attendees.map(att => 
        att.studentId === studentId ? { ...att, attended: newStatus } : att
      ));
    } catch (err) { alert("Failed to mark attendance."); }
  };

  return (
    <div className="bg-white p-5 rounded shadow border-l-4 border-blue-500 mb-4 transition hover:shadow-md relative group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{event.title}</h3>
          <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</p>
        </div>
        
        <div className="flex space-x-2">
          {/* EDIT BUTTON */}
          <button 
            onClick={() => onEdit(event)}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(event.id)}
            className="text-red-500 hover:text-red-700 font-bold text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
          >
            Delete
          </button>
          <button 
            onClick={fetchAttendees}
            className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded border border-blue-200"
          >
            {showAttendees ? "Close List" : "Manage Attendance"}
          </button>
        </div>
      </div>

      {/* --- SEAT STATS BAR --- */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
          <span>Registrations: {registeredCount} / {capacity}</span>
          <span className={seatsLeft === 0 ? "text-red-600" : "text-green-600"}>
            {seatsLeft === 0 ? "SOLD OUT" : `${seatsLeft} Seats Left`}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${seatsLeft === 0 ? 'bg-red-500' : 'bg-blue-600'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Attendee List */}
      {showAttendees && (
        <div className="mt-4 bg-gray-50 p-3 rounded text-sm border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-700">Student List ({attendees.length})</h4>
            <span className="text-xs text-gray-500">Check to mark present</span>
          </div>
          {attendees.length === 0 ? <p className="text-gray-500 italic">No registrations yet.</p> : (
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
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={item.attended} onChange={() => toggleAttendance(item.studentId, item.attended)} />
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

export default EventCard;