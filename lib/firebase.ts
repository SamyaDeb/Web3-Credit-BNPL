import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB2KK3AKMTZWaLs7vYW0snycMEPu0KG2UQ",
  authDomain: "zentra-b5ea1.firebaseapp.com",
  projectId: "zentra-b5ea1",
  storageBucket: "zentra-b5ea1.firebasestorage.app",
  messagingSenderId: "506708360536",
  appId: "1:506708360536:web:b19d26f9bb034c622b792d",
  measurementId: "G-KQ0RY2GNDF"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
