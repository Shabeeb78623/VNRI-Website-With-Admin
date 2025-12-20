
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppContextType, AppData, CommitteeMember, GalleryImage, ContactMessage, SiteSettings } from '../types';
import { INITIAL_MAIN_COMMITTEE, INITIAL_BALAVEDHI_COMMITTEE, INITIAL_GALLERY_IMAGES, INITIAL_SITE_SETTINGS } from '../constants';
import { db } from '../firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc,
  writeBatch
} from 'firebase/firestore';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Independent states for each collection
  const [mainCommittee, setMainCommittee] = useState<CommitteeMember[]>([]);
  const [balavedhiCommittee, setBalavedhiCommittee] = useState<CommitteeMember[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // --- Firestore Sync Logic ---
  useEffect(() => {
    if (!db) {
      setMainCommittee(INITIAL_MAIN_COMMITTEE);
      setBalavedhiCommittee(INITIAL_BALAVEDHI_COMMITTEE);
      setGalleryImages(INITIAL_GALLERY_IMAGES);
      setSiteSettings(INITIAL_SITE_SETTINGS);
      setIsLoading(false);
      return; 
    }

    let loadedCount = 0;
    const TOTAL_SOURCES = 4;
    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_SOURCES) setIsLoading(false);
    };

    // Helper to handle permission errors gracefully on read
    const handleReadError = (err: any, defaultData: any, setter: any) => {
      console.warn(`Firestore Read Error (Using default data):`, err.message);
      setter(defaultData);
      checkLoading();
    };

    const unsubMain = onSnapshot(collection(db, 'main_committee'), (snapshot) => {
      if (!snapshot.empty) {
        setMainCommittee(snapshot.docs.map(d => d.data() as CommitteeMember).sort((a,b) => a.id.localeCompare(b.id)));
      } else if (loadedCount === 0) {
        setMainCommittee(INITIAL_MAIN_COMMITTEE);
      }
      checkLoading();
    }, (err) => handleReadError(err, INITIAL_MAIN_COMMITTEE, setMainCommittee));

    const unsubBalavedhi = onSnapshot(collection(db, 'balavedhi_committee'), (snapshot) => {
      if (!snapshot.empty) {
        setBalavedhiCommittee(snapshot.docs.map(d => d.data() as CommitteeMember).sort((a,b) => a.id.localeCompare(b.id)));
      } else if (loadedCount === 0) {
        setBalavedhiCommittee(INITIAL_BALAVEDHI_COMMITTEE);
      }
      checkLoading();
    }, (err) => handleReadError(err, INITIAL_BALAVEDHI_COMMITTEE, setBalavedhiCommittee));

    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      if (!snapshot.empty) {
        setGalleryImages(snapshot.docs.map(d => d.data() as GalleryImage));
      } else if (loadedCount === 0) {
        setGalleryImages(INITIAL_GALLERY_IMAGES);
      }
      checkLoading();
    }, (err) => handleReadError(err, INITIAL_GALLERY_IMAGES, setGalleryImages));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data() as SiteSettings);
      } else if (loadedCount === 0) {
        setSiteSettings(INITIAL_SITE_SETTINGS);
      }
      checkLoading();
    }, (err) => handleReadError(err, INITIAL_SITE_SETTINGS, setSiteSettings));

    return () => {
      unsubMain();
      unsubBalavedhi();
      unsubGallery();
      unsubSettings();
    };
  }, []);

  // --- CRUD Operations with Local Fallback ---

  const saveMember = async (type: 'main' | 'balavedhi', member: CommitteeMember) => {
    // Optimistic Update / Fallback function
    const updateLocal = () => {
      const setter = type === 'main' ? setMainCommittee : setBalavedhiCommittee;
      setter(prev => {
        const index = prev.findIndex(m => m.id === member.id);
        if (index >= 0) {
          const newArr = [...prev];
          newArr[index] = member;
          return newArr;
        }
        return [...prev, member];
      });
    };

    if (!db) {
      updateLocal();
      alert("Database not connected. Saved locally.");
      return;
    }

    try {
      const colName = type === 'main' ? 'main_committee' : 'balavedhi_committee';
      await setDoc(doc(db, colName, member.id), member);
    } catch (e: any) {
      console.warn("Firestore write failed, falling back to local state:", e.message);
      updateLocal();
      // Only alert if it's a permission error specifically
      if (e.code === 'permission-denied') {
        alert("Permission Denied: Saved locally only. (Update Firestore Rules in Console to persist)");
      } else {
        alert(`Saved locally (Error: ${e.message})`);
      }
    }
  };

  const deleteMember = async (type: 'main' | 'balavedhi', id: string) => {
    const updateLocal = () => {
      const setter = type === 'main' ? setMainCommittee : setBalavedhiCommittee;
      setter(prev => prev.filter(m => m.id !== id));
    };

    if (!db) { updateLocal(); return; }

    try {
      const colName = type === 'main' ? 'main_committee' : 'balavedhi_committee';
      await deleteDoc(doc(db, colName, id));
    } catch (e: any) {
      console.warn("Firestore delete failed, using local fallback:", e.message);
      updateLocal();
      alert("Deleted locally (Permission Denied)");
    }
  };

  const saveGalleryImage = async (image: GalleryImage) => {
    const updateLocal = () => {
      setGalleryImages(prev => {
        const index = prev.findIndex(img => img.id === image.id);
        if (index >= 0) {
           const newArr = [...prev];
           newArr[index] = image;
           return newArr;
        }
        return [...prev, image];
      });
    };

    if (!db) { updateLocal(); return; }

    try {
      await setDoc(doc(db, 'gallery', image.id), image);
    } catch (e: any) {
      console.warn("Firestore save image failed:", e.message);
      updateLocal();
      alert("Image saved locally (Permission Denied)");
    }
  };

  const deleteGalleryImage = async (id: string) => {
    const updateLocal = () => setGalleryImages(prev => prev.filter(img => img.id !== id));
    
    if (!db) { updateLocal(); return; }

    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (e: any) {
      console.warn("Firestore delete image failed:", e.message);
      updateLocal();
      alert("Image deleted locally (Permission Denied)");
    }
  };

  const saveSiteSettings = async (settings: SiteSettings) => {
    const updateLocal = () => setSiteSettings(settings);

    if (!db) { updateLocal(); return; }

    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (e: any) {
      console.warn("Settings save failed:", e.message);
      updateLocal();
      alert("Settings saved locally (Permission Denied)");
    }
  };
  
  // Message is fire-and-forget for now
  const saveMessage = async (msg: ContactMessage) => {
    if (db) {
       try { await addDoc(collection(db, 'messages'), msg); } 
       catch (e) { console.warn("Message save failed", e); }
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

  const data: AppData = {
    mainCommittee,
    balavedhiCommittee,
    galleryImages,
    siteSettings
  };

  return (
    <AppContext.Provider value={{ 
      data, 
      isAuthenticated,
      isLoading, 
      login, 
      logout, 
      currentView, 
      navigateTo,
      saveMember,
      deleteMember,
      saveGalleryImage,
      deleteGalleryImage,
      saveMessage,
      saveSiteSettings
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
