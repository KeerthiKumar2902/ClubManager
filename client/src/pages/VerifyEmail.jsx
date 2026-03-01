import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      // 1. Grab the live URL from Vercel's environment variables
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      try {
        // 2. Use the dynamic API_URL
        await axios.post(`${API_URL}/api/auth/verify-email`, { token });
        setStatus("success");
        // Redirect to login after 3 seconds
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setStatus("error");
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>

        {status === "verifying" && (
          <p className="text-gray-600 animate-pulse">Verifying your email...</p>
        )}

        {status === "success" && (
          <div>
            <p className="text-green-600 font-bold text-lg mb-2">
              ✅ Verified Successfully!
            </p>
            <p className="text-gray-500">Redirecting to login...</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="text-red-500 font-bold mb-4">
              ❌ Verification Failed
            </p>
            <p className="text-gray-600 mb-4">
              The token might be invalid or expired.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
