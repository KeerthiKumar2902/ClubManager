import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Import the new pages
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';

import ClubsList from './pages/ClubsList';     // <--- ADD THIS
import ClubProfile from './pages/ClubProfile';


function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clubs" element={<ClubsList />} />          
        <Route path="/clubs/:id" element={<ClubProfile />} />
        
        {/* --- NEW SECURITY ROUTES --- */}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/google-callback" element={<GoogleCallback />} />
      </Routes>
    </div>
  );
}

export default App;