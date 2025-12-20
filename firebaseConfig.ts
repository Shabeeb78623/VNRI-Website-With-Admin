import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// --- INSTRUCTIONS ---
// 1. Go to: https://console.firebase.google.com/
// 2. Click on your project
// 3. Click the Gear Icon (⚙️) -> "Project Settings"
// 4. Scroll down to "Your apps". Select "Config".
// 5. Copy the values CAREFULLY. Each field is DIFFERENT.

export const firebaseConfig = {
  apiKey: "AIzaSyDc1c8_AyOn3Rfp_-YlZYwLAf716xHT7qk",            
  authDomain: "vnri-67.firebaseapp.com",    
  projectId: "vnri-67",      
  appId: "1:74609157126:web:5ce22339b5eac19d74cf87",              
  messagingSenderId: "74609157126" // Fixed: This must be the number from the appId
};

// Initialize Firebase
// We use a try-catch here so the app doesn't crash white-screen if config is bad
let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;

try {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

export const db = dbInstance;
export default app;