1st choice
import { useState, useRef } from 'react';
import Tabs from './Tabs';
import FoodLibrary from './FoodLibrary';
import EquipmentBullpen from './EquipmentBullpen';
import Editor from './Editor';

const Dashboard = ({ userProfile, onLoadEvent, cropProp }) => {
  const [view, setView] = useState('newEvent'); // Default to the new event tab
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && cropProp) {
      const reader = new FileReader();
      reader.onload = (event) => {
        cropProp(event.target.result); // Pass the data URL to cropProp
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const NewEventComponent = () => (
    <div className="text-center card">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.txt"
      />
      <h3 className="mb-4">Create a New Event</h3>
      <p className="text-gray-600 mb-6">Start by uploading a photo of your event space or a BEO text file.</p>
      <button onClick={() => fileInputRef.current.click()} className="btn btn-green">
        Upload File
      </button>
    </div>
  );


  const tabs = [
    { name: 'New Event', content: <NewEventComponent /> },
    { name: 'Food Library', content: <FoodLibrary /> },
    { name: 'Equipment Bullpen', content: <EquipmentBullpen /> },
    { name: 'Manage Subscription', content: <div className="card">Subscription management will go here.</div> },
  ];

  return (
    <div>
      <Tabs tabs={tabs} />
      {/* The EventList can be a separate component below the tabs */}
      <div className="mt-12 card">
        <h2 className="mb-6 text-center">Your Events</h2>
        {/* We need to pass onLoadEvent to EventList */}
        {/* <EventList userProfile={userProfile} onLoadEvent={onLoadEvent} /> */}
      </div>
    </div>
  );
};

export default Dashboard;
