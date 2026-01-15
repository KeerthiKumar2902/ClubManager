import React from 'react';
import DashboardContainer from './dashboard/index';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Basic layout wrapper with Logout button
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <div className="font-bold text-xl">Club Manager</div>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-red-500 font-bold hover:underline">Logout</button>
      </div>
      
      {/* Load the sub-dashboards */}
      <DashboardContainer />
    </div>
  );
};

export default Dashboard;