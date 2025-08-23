import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import PhotoTagger from './PhotoTagger';
import SchematicBuilder from './SchematicBuilder';
import BEOImporter from './BEOImporter';
import ExportOptions from './ExportOptions';

const Editor = ({ userProfile, event, onBack, initialFile }) => {
  const [activeTab, setActiveTab] = useState('photo');
  const [eventName, setEventName] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [taggedItems, setTaggedItems] = useState([]);
  const [schematicItems, setSchematicItems] = useState([]);

  useEffect(() => {
    if (event) {
      setEventName(event.name || '');
      setImageUrl(event.imageUrl || null);
      setTaggedItems(event.items || []);
      setSchematicItems(event.schematic || []);
    }
  }, [event]);

  const handleImageUploadSuccess = (url) => {
    setImageUrl(url);
  };

  const handleSave = async () => {
    if (userProfile) {
      const path = userProfile.tier === 1 ? `users/${userProfile.uid}/events` : `organizations/${userProfile.orgId}/events`;
      const eventData = {
        name: eventName,
        imageUrl: imageUrl,
        items: taggedItems,
        schematic: schematicItems,
        userId: userProfile.uid,
        creatorUid: userProfile.uid,
        createdAt: event ? event.createdAt : new Date(),
        updatedAt: new Date(),
      };

      try {
        if (event && event.id) {
          // Update existing event
          const eventRef = doc(db, path, event.id);
          await updateDoc(eventRef, eventData);
        } else {
          // Create new event
          await addDoc(collection(db, path), eventData);
        }
        // onBack(); // This should be handled by the save popup
      } catch (error) {
        console.error("Error saving document: ", error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Image Tagger */}
      <div className="md:col-span-2">
        <PhotoTagger
          onImageUploadSuccess={handleImageUploadSuccess}
          imageUrl={imageUrl}
          taggedItems={taggedItems}
          setTaggedItems={setTaggedItems}
          initialFile={initialFile}
        />
      </div>

      {/* Right Column: List Items, Schematic, etc. */}
      <div className="md:col-span-1">
        <div className="card">
          <h3 className="mb-4">Event Details</h3>
          <div className="mb-4">
            <label htmlFor="event-name-input" className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input
              type="text"
              id="event-name-input"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="input-field"
              placeholder="e.g., Company Breakfast"
            />
          </div>
          <div id="list-section">
            <h3 className="mb-4">Tagged Dishes</h3>
            <ul id="item-list" className="space-y-3">
              {taggedItems.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-2 border-b">
                  <span>{index + 1}. {item.item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <button onClick={handleSave} className="btn btn-green w-full">Save Event</button>
            <button onClick={onBack} className="btn btn-gray w-full mt-4">Back to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
