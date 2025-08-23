import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWeSG2KmQ6UGOYbPskzxz0RWtpoUeLuzE",
  authDomain: "aiq-storage-systems.firebaseapp.com",
  projectId: "aiq-storage-systems",
  storageBucket: "gs://aiq-storage-systems.firebasestorage.app",
  messagingSenderId: "891454194265",
  appId: "1:891454194265:web:ebf8742a0a6af3c70a2748"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
