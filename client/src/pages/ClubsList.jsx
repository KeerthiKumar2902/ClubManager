import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaUsers, FaArrowRight } from 'react-icons/fa';

const ClubsList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/clubs`);
        setClubs(res.data);
      } catch (err) {
        console.error("Failed to fetch clubs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, [API_URL]);

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Explore Communities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your tribe. Join a club that matches your passion, from Robotics to Music.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <FaSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
          <input 
            type="text" 
            placeholder="Search for clubs..." 
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClubs.map(club => (
              <div key={club.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden flex flex-col border border-gray-100 group">
                
                {/* Banner Placeholder */}
                <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl border-4 border-white">
                      🏛️
                    </div>
                  </div>
                </div>

                <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
                    {club.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {club.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
                      <FaUsers /> {club.events?.length || 0} Events Active
                    </span>
                    <Link 
                      to={`/clubs/${club.id}`}
                      className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Visit Club <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredClubs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No clubs found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsList;