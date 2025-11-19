
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- INSTRUCTIONS ---
// 1. Go to: https://console.firebase.google.com/
// 2. Click on your project
// 3. Click the Gear Icon (⚙️) -> "Project Settings"
// 4. Scroll down to "Your apps". Select "Config".
// 5. Copy the values CAREFULLY. Each field is DIFFERENT.

export const firebaseConfig =
 {
  apiKey: "AIzaSyDc1c8_AyOn3Rfp_-YlZYwLAf716xHT7qk",            // Starts with AIza...
  authDomain: "vnri-67.firebaseapp.com",    // Ends with .firebaseapp.com
  projectId: "vnri-67",      // Your project name, e.g. vnri-forum
  appId: "1:74609157126:web:5ce22339b5eac19d74cf87",              // Starts with 1:...
  messagingSenderId: "G-K3M2561Q8X" // Numbers only
};

// Initialize Firebase
// We use a try-catch here so the app doesn't crash white-screen if config is bad
let app;
let dbInstance;

try {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

export const db = dbInstance;
export default app;
