import React from 'react';
import useAuthStore from '../../store/authStore';
import SuperAdminDash from './SuperAdminDash';
import ClubAdminDash from './ClubAdminDash';
import StudentDash from './StudentDash';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="dashboard-container">
      {user.role === 'SUPER_ADMIN' && <SuperAdminDash />}
      {user.role === 'CLUB_ADMIN' && <ClubAdminDash />}
      {user.role === 'STUDENT' && <StudentDash />}
    </div>
  );
};

export default Dashboard;