import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar Placeholder */}
      <nav className="p-4 bg-gray-800 text-white flex justify-between">
        <h1 className="font-bold text-xl">UniClub</h1>
        <div>
          <a href="/" className="mr-4">Home</a>
          <a href="/login">Login</a>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;