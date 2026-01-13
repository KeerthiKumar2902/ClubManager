import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events from our backend!
    axios.get('http://localhost:5000/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-6">UniClub Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="border p-4 rounded shadow hover:shadow-lg">
            <h2 className="text-2xl font-bold">{event.title}</h2>
            <p className="text-gray-600">{event.date}</p>
            <p className="mt-2">{event.description}</p>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded mt-2">
              {event.club.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;