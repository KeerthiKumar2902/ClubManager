import React from 'react';
import useAuthStore from '../store/authStore';

// Import the sub-dashboards from the 'dashboard' folder
import SuperAdminDash from './dashboard/SuperAdminDash';
import ClubAdminDash from './dashboard/ClubAdminDash';
import StudentDash from './dashboard/StudentDash';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* This component acts ONLY as a switcher. 
          It has NO visual elements (header/footer) of its own.
      */}
      {user.role === 'SUPER_ADMIN' && <SuperAdminDash />}
      {user.role === 'CLUB_ADMIN' && <ClubAdminDash />}
      {user.role === 'STUDENT' && <StudentDash />}
    </div>
  );
};

export default Dashboard;