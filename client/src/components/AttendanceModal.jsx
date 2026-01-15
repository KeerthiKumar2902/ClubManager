import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaUserCircle, FaSearch } from 'react-icons/fa';

const AttendanceModal = ({ event, token, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // 1. Fetch Attendees
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/${event.id}/attendees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendees(res.data);
      } catch (err) {
        console.error("Failed to load attendees");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [event, token, API_URL]);

  // 2. Toggle Attendance Status
  const toggleAttendance = async (studentId, currentStatus) => {
    // Optimistic UI Update (Instant change before API)
    setAttendees(attendees.map(a => 
      a.studentId === studentId ? { ...a, attended: !currentStatus } : a
    ));

    try {
      await axios.put(`${API_URL}/api/events/${event.id}/attendance`, 
        { studentId, status: !currentStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert("Failed to update attendance");
      // Revert if failed
      setAttendees(attendees.map(a => 
        a.studentId === studentId ? { ...a, attended: currentStatus } : a
      ));
    }
  };

  // Filter List
  const filteredAttendees = attendees.filter(a => 
    a.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              📋 Manage Attendance
            </h2>
            <p className="text-gray-400 text-sm mt-1">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">✕</button>
        </div>

        {/* Search Bar & Stats */}
        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search student..." 
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm font-medium text-gray-600">
            Present: <span className="text-green-600 font-bold">{attendees.filter(a => a.attended).length}</span> / {attendees.length}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading list...</div>
          ) : filteredAttendees.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No students found.</div>
          ) : (
            <div className="space-y-2">
              {filteredAttendees.map((record) => (
                <div key={record.studentId} className={`flex justify-between items-center p-4 rounded-xl border transition ${record.attended ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-gray-500 text-xl">
                      <FaUserCircle />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{record.student.name}</p>
                      <p className="text-xs text-gray-500">{record.student.email}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleAttendance(record.studentId, record.attended)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition ${
                      record.attended 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {record.attended ? <><FaCheckCircle /> Present</> : <><FaTimesCircle /> Absent</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;