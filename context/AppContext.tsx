
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppContextType, AppData, CommitteeMember, GalleryImage } from '../types';
import { INITIAL_MAIN_COMMITTEE, INITIAL_BALAVEDHI_COMMITTEE, INITIAL_GALLERY_IMAGES } from '../constants';
import { db } from '../firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Independent states for each collection
  const [mainCommittee, setMainCommittee] = useState<CommitteeMember[]>(INITIAL_MAIN_COMMITTEE);
  const [balavedhiCommittee, setBalavedhiCommittee] = useState<CommitteeMember[]>(INITIAL_BALAVEDHI_COMMITTEE);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(INITIAL_GALLERY_IMAGES);

  // --- Firestore Sync Logic ---
  useEffect(() => {
    if (!db) return; // DB init failed

    // Subscribe to Main Committee
    const unsubMain = onSnapshot(collection(db, 'main_committee'), (snapshot) => {
      if (snapshot.empty) {
        seedCollection('main_committee', INITIAL_MAIN_COMMITTEE);
      } else {
        const members = snapshot.docs.map(d => d.data() as CommitteeMember);
        setMainCommittee(members.sort((a,b) => a.id.localeCompare(b.id)));
      }
    }, (err) => console.error("DB Error Main:", err));

    // Subscribe to Balavedhi Committee
    const unsubBalavedhi = onSnapshot(collection(db, 'balavedhi_committee'), (snapshot) => {
      if (snapshot.empty) {
        seedCollection('balavedhi_committee', INITIAL_BALAVEDHI_COMMITTEE);
      } else {
        const members = snapshot.docs.map(d => d.data() as CommitteeMember);
        setBalavedhiCommittee(members.sort((a,b) => a.id.localeCompare(b.id)));
      }
    }, (err) => console.error("DB Error Balavedhi:", err));

    // Subscribe to Gallery
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      if (snapshot.empty) {
        seedCollection('gallery', INITIAL_GALLERY_IMAGES);
      } else {
        const images = snapshot.docs.map(d => d.data() as GalleryImage);
        setGalleryImages(images);
      }
    }, (err) => console.error("DB Error Gallery:", err));

    return () => {
      unsubMain();
      unsubBalavedhi();
      unsubGallery();
    };
  }, []);

  // Helper to seed initial data
  const seedCollection = async (colName: string, data: any[]) => {
    if (!db) return;
    console.log(`Seeding ${colName}...`);
    try {
      const batch = writeBatch(db);
      data.forEach(item => {
        const ref = doc(db, colName, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    } catch (e: any) {
      console.error("Seeding failed:", e);
      // Don't alert on seeding failure, it might just be permission denied in read-only mode
    }
  };

  // --- CRUD Operations ---

  const saveMember = async (type: 'main' | 'balavedhi', member: CommitteeMember) => {
    if (!db) {
      alert("Database not connected. Check firebaseConfig.ts");
      return;
    }
    const colName = type === 'main' ? 'main_committee' : 'balavedhi_committee';
    try {
      await setDoc(doc(db, colName, member.id), member);
    } catch (e: any) {
      console.error("Error saving member:", e);
      alert(`Error saving member: ${e.message}`);
    }
  };

  const deleteMember = async (type: 'main' | 'balavedhi', id: string) => {
    if (!db) return;
    const colName = type === 'main' ? 'main_committee' : 'balavedhi_committee';
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (e: any) {
      console.error("Error deleting member:", e);
      alert(`Error deleting: ${e.message}`);
    }
  };

  const saveGalleryImage = async (image: GalleryImage) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'gallery', image.id), image);
    } catch (e: any) {
      console.error("Error saving image:", e);
      alert(`Error saving image: ${e.message}`);
    }
  };

  const deleteGalleryImage = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (e: any) {
      console.error("Error deleting image:", e);
      alert(`Error deleting: ${e.message}`);
    }
  };

  // --- Auth & View State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');

  const login = (u: string, p: string) => {
    if (u === 'Shabeeb' && p === 'ShabeeB@2025') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentView('home');
  };

  const navigateTo = (view: 'home' | 'admin') => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  // Derived full data object for compatibility
  const data: AppData = {
    mainCommittee,
    balavedhiCommittee,
    galleryImages
  };

  return (
    <AppContext.Provider value={{ 
      data, 
      isAuthenticated, 
      login, 
      logout, 
      currentView, 
      navigateTo,
      saveMember,
      deleteMember,
      saveGalleryImage,
      deleteGalleryImage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
