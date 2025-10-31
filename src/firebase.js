// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQ0X7aXiiBxDLCXf_rp3CpNelypTpMAUo",
  authDomain: "carrerflow-a73c1.firebaseapp.com",
  projectId: "carrerflow-a73c1",
  storageBucket: "carrerflow-a73c1.firebasestorage.app",
  messagingSenderId: "391235321572",
  appId: "1:391235321572:web:5895cd68d3487c038bb6f1",
  measurementId: "G-98NVRH3QQB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics if running in the browser (not on server)
let analytics;
if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
