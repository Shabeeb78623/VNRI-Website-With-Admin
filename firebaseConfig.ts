
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- HOW TO FIND YOUR KEYS ---
// 1. Go to: https://console.firebase.google.com/
// 2. Click on your project "vnri-forum"
// 3. Click the Gear Icon (⚙️) in the top-left sidebar -> "Project Settings"
// 4. Scroll down to "Your apps"
// 5. If no app is listed, click the "</>" icon to create one.
// 6. Copy the values from the "const firebaseConfig = {...}" box.

const firebaseConfig = {
  apiKey: "AIzaSyDc1c8_AyOn3Rfp_-YlZYwLAf716xHT7qk",           // e.g. "AIzaSyD..."
  authDomain: "AIzaSyDc1c8_AyOn3Rfp_-YlZYwLAf716xHT7qk",   // e.g. "vnri-forum.firebaseapp.com"
  projectId: "AIzaSyDc1c8_AyOn3Rfp_-YlZYwLAf716xHT7qk",     // e.g. "vnri-forum"
  appId: "AIzaSyDc1c8_AyOn3Rfp_-YlZYwLAf716xHT7qk",             // e.g. "1:123456789:web:..."
  messagingSenderId: "AIzaSyDc1c8_AyOn3Rfp_-YlZYwLAf716xHT7qk"    // e.g. "123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Database (Firestore)
export const db = getFirestore(app);

export default app;
