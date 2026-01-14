import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  // Toggle for Success View
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- PASSWORD VALIDATION STATE ---
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Update criteria whenever password changes
  useEffect(() => {
    const p = formData.password;
    const criteria = {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
    };

    setPasswordCriteria(criteria);
    // Valid only if ALL values in the object are true
    setIsPasswordValid(Object.values(criteria).every(Boolean));
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Double Check (Security)
    if (!isPasswordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setRegistrationSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW 1: SUCCESS MESSAGE ---
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center border-t-4 border-green-500">
          <div className="mb-4 text-6xl">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <span className="font-semibold text-gray-800">{formData.email}</span>.
          </p>
          <p className="text-sm text-gray-500 mb-8 bg-gray-100 p-3 rounded">
            Please check your inbox (and spam folder). You cannot login until you verify your account.
          </p>
          
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // --- VIEW 2: REGISTRATION FORM ---
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-10">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700">Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="w-full border p-2 rounded mt-1"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input 
              type="email" 
              name="email" 
              className="w-full border p-2 rounded mt-1"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-700">Password</label>
            <input 
              type="password" 
              name="password" 
              className={`w-full border p-2 rounded mt-1 ${isPasswordValid && formData.password ? 'border-green-500 ring-1 ring-green-500' : ''}`}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* --- PASSWORD CHECKLIST --- */}
          <div className="mb-6 bg-gray-50 p-3 rounded text-xs space-y-1">
            <p className="font-semibold text-gray-500 mb-2">Password must contain:</p>
            
            <CriteriaItem met={passwordCriteria.length} label="At least 8 characters" />
            <CriteriaItem met={passwordCriteria.upper} label="Uppercase letter (A-Z)" />
            <CriteriaItem met={passwordCriteria.lower} label="Lowercase letter (a-z)" />
            <CriteriaItem met={passwordCriteria.number} label="Number (0-9)" />
            <CriteriaItem met={passwordCriteria.special} label="Special character (!@#...)" />
          </div>

          <button 
            type="submit" 
            disabled={loading || !isPasswordValid}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Checklist Items
const CriteriaItem = ({ met, label }) => (
  <div className={`flex items-center ${met ? 'text-green-600' : 'text-gray-400'}`}>
    <span className="mr-2">{met ? '✔' : '○'}</span>
    {label}
  </div>
);

export default Register;