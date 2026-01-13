import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Protect the Route: If no user, kick them back to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null; // Avoid flash of content

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-xl font-semibold">Welcome back, {user.name}!</h2>
        <p className="text-gray-600 mt-2">Role: <span className="font-mono bg-gray-200 px-1 rounded">{user.role}</span></p>
        <p className="text-gray-600">Email: {user.email}</p>
      </div>
    </div>
  );
};

export default Dashboard;