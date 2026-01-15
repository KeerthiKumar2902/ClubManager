import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaCheck, FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Validation
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false, upper: false, lower: false, number: false, special: false
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);

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
    setIsPasswordValid(Object.values(criteria).every(Boolean));
  }, [formData.password]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!isPasswordValid) { setError("Please meet all password requirements."); return; }
    
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/auth/register`, formData);
      setRegistrationSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${API_URL}/api/auth/google`;
  };

  // --- SUCCESS VIEW (Light Mode) ---
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border-t-4 border-green-500">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            <FaEnvelope />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a link to <span className="font-bold text-gray-900">{formData.email}</span>.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 mb-8 border border-gray-200">
            Please check your inbox (and spam). You must verify before logging in.
          </div>
          <Link to="/login" className="inline-block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-md">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // --- FORM VIEW (Light Mode) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
            <FaUserPlus className="text-xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500">Join the community today</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border-l-4 border-red-500">{error}</div>}

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUser className="text-gray-400" /></div>
                <input type="text" name="name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="text-gray-400" /></div>
                <input type="email" name="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="text-gray-400" /></div>
                <input 
                  type="password" 
                  name="password" 
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${isPasswordValid ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-purple-500'}`} 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Password Rules Checklist */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs space-y-2">
            <p className="font-bold text-gray-500 uppercase tracking-wide mb-2">Password Strength</p>
            <div className="grid grid-cols-2 gap-2">
              <CriteriaItem met={passwordCriteria.length} label="8+ chars" />
              <CriteriaItem met={passwordCriteria.upper} label="Uppercase (A-Z)" />
              <CriteriaItem met={passwordCriteria.lower} label="Lowercase (a-z)" />
              <CriteriaItem met={passwordCriteria.number} label="Number (0-9)" />
              <CriteriaItem met={passwordCriteria.special} label="Symbol (!@#)" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !isPasswordValid}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or sign up with</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <FaGoogle className="text-red-500 text-lg" />
            Google
          </button>
        </form>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

// Helper Component for Checklist
const CriteriaItem = ({ met, label }) => (
  <div className={`flex items-center gap-2 transition-colors duration-200 ${met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
    {met ? <FaCheck className="text-[10px]" /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300"></div>}
    {label}
  </div>
);

export default Register;