"use client"
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import Auth from '../components/Auth';
import Dashboard from '../components/Dashboard';
import Layout from '../components/Layout';
import PhotoTagger from '../components/PhotoTagger';
import { FileData } from '../lib/types'; // Assuming you have a type definition for file data

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<DocumentData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'imageDisplayCrop' | 'photoTagger'>('dashboard');
  const [imageData, setImageData] = useState<FileData | null>(null); // State to hold image data
  useEffect(() => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'photoTagger'>('dashboard');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
        setUser(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoadingProfile(false);
    });
    return () => unsubscribe();
  }, []);

  const navigateToImageDisplayCrop = (data: FileData) => {
    setImageData(data); // Store image data
    setCurrentView('imageDisplayCrop'); // Change view to image display/crop

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main>
        <Auth />
      </main>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="card text-center">
          <h2>Profile Error</h2>
          <p>Could not load user profile. Please try again later or contact support.</p>
        </div>
      </Layout>
    );
  }

  // Conditional rendering based on currentView
  if (currentView === 'photoTagger') {
    return (
      <Layout>
        <PhotoTagger userProfile={userProfile} imageData={imageData} /> {/* Pass imageData to PhotoTagger */}
      </Layout>
    );
  }

  if (currentView === 'imageDisplayCrop') {
    return <div className="min-h-screen flex items-center justify-center">Image Display and Crop Placeholder</div>; // Placeholder for Image Display/Crop component
  }

  return (
    <Layout>
      <Dashboard userProfile={userProfile} navigateToImageDisplayCrop={navigateToImageDisplayCrop} /> {/* Pass navigateToImageDisplayCrop to Dashboard */}
    </Layout>
  );
}
