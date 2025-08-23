const PhotoTagger = ({ userProfile, initialImageData }) => { // Receive initialImageData
      // ... rest of the component
    };
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { hotBuffetItems } from '../lib/hotBuffet';
import { coldBuffetItems } from '../lib/coldBuffet';
import { beverageItems } from '../lib/beverages';
import { coffeeBreakItems } from '../lib/coffeeBreak';
import { snackItems } from '../lib/snacks';
import { stationItems } from '../lib/stations';
import { dessertItems } from '../lib/desserts';

const PhotoTagger = ({ onImageUploadSuccess, imageUrl, taggedItems, setTaggedItems, initialFile }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [foodItems, setFoodItems] = useState({
    ...hotBuffetItems,
    ...coldBuffetItems,
    ...beverageItems,
    ...coffeeBreakItems,
    ...snackItems,
    ...stationItems,
    ...dessertItems,
  });
  const [showFoodMenu, setShowFoodMenu] = useState(null);



  const handleUpload = (file) => {
    if (!file) return;

    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onImageUploadSuccess(downloadURL);
        });
      }
    );
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setShowFoodMenu({ x, y });
  };

  const handleFoodSelect = (category, item) => {
    const newItems = [...taggedItems, { x: showFoodMenu.x, y: showFoodMenu.y, category, item }];
    setTaggedItems(newItems);
    setShowFoodMenu(null);
  };

  return (
    <div className="card">
      {showFoodMenu && (
        <div style={{ position: 'absolute', left: showFoodMenu.x, top: showFoodMenu.y, zIndex: 40 }} className="bg-white border rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto">
          {Object.keys(foodItems).map(category => (
            <div key={category}>
              <h4 className="font-bold text-sm p-2">{category}</h4>
              <ul className="text-sm">
                {foodItems[category].map(item => (
                  <li key={item} onClick={() => handleFoodSelect(category, item)} className="cursor-pointer hover:bg-gray-100 p-2 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div id="image-section">
        {imageUrl ? (
          <div id="image-container" className="relative w-full cursor-crosshair rounded-lg overflow-hidden shadow-inner border" onClick={handleImageClick}>
            <Image
              id="image-preview"
              src={imageUrl}
              alt="Event Preview"
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
            <div id="marker-container">
              {taggedItems.map((item, index) => (
                <div
                  key={index}
                  style={{ left: `${(item.x / 1920) * 100}%`, top: `${(item.y / 1080) * 100}%` }}
                  className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div id="upload-prompt" className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            <h3 className="mt-4 text-lg text-gray-600">Uploading...</h3>
            {uploadProgress > 0 && <progress value={uploadProgress} max="100" className="w-full mt-4" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoTagger;
