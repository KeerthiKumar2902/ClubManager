import React, { useState } from 'react';
import axios from 'axios';

const CreateClubForm = ({ token, onClubCreated }) => {
  const [clubForm, setClubForm] = useState({ 
    clubName: '', clubDescription: '', 
    adminName: '', adminEmail: '', adminPassword: '' 
  });
  const [message, setMessage] = useState('');

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/clubs', clubForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Pass the new data back up
      onClubCreated(res.data.club);

      setMessage('Club & Admin Created!');
      setClubForm({ clubName: '', clubDescription: '', adminName: '', adminEmail: '', adminPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage(err.response?.data?.error || 'Error creating club.'); }
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg border h-fit">
      {message && <p className="mb-4 text-sm text-green-600 font-bold bg-green-100 p-2 rounded text-center">{message}</p>}
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
    </div>
  );
};

export default CreateClubForm;