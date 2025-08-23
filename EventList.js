import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const EventList = ({ userProfile, onLoadEvent }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      setLoading(true);
      const path = userProfile.tier === 1 ? `users/${userProfile.uid}/events` : `organizations/${userProfile.orgId}/events`;
      const q = query(collection(db, path));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching events: ", error);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div id="event-list" className="space-y-3 w-full max-w-lg">
      {events.length === 0 ? (
        <p className="text-gray-500 text-center">No events yet. Click "New Event" to get started!</p>
      ) : (
        events.map(event => (
          <div key={event.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center transition-transform transform hover:scale-105">
            <span className="font-medium">{event.name || 'Untitled Event'}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => onLoadEvent(event)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Open</button>
              <button data-id={event.id} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200">Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EventList;
