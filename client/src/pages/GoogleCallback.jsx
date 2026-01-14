import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        
        // Save to Store
        login(token, user);
        
        // Redirect to Dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to parse user data", err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return <div className="text-center mt-20">Processing login...</div>;
};

export default GoogleCallback;