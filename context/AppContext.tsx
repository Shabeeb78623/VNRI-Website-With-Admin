
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

// Extend AppContextType to include error state
interface ExtendedAppContextType extends AppContextType {
  dbError: string | null;
}

const AppContext = createContext<ExtendedAppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Independent states for each collection
  const [mainCommittee, setMainCommittee] = useState<CommitteeMember[]>([]);
  const [balavedhiCommittee, setBalavedhiCommittee] = useState<CommitteeMember[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

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

    const handleReadError = (err: any, defaultData: any, setter: any) => {
      console.warn(`Firestore Read Error:`, err.message);
      if (err.code === 'permission-denied') {
        setDbError('permission-denied');
      }
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

  const handleError = (e: any) => {
    console.warn("Firestore Operation Failed:", e.message);
    if (e.code === 'permission-denied') {
      setDbError('permission-denied');
      // We do NOT alert here anymore to keep the UI clean. 
      // The Dashboard will show a banner instead.
    } else if (e.message.includes("circular structure")) {
      alert("Error: Attempted to save invalid data (Circular JSON). Please refresh and try again.");
    }
  };

  const saveMember = async (type: 'main' | 'balavedhi', member: CommitteeMember) => {
    // Sanitize input to ensure it is a plain object
    const cleanMember: CommitteeMember = {
        id: member.id,
        name: member.name || '',
        role: member.role || '',
        avatarText: member.avatarText || '',
        image: member.image || ''
    };

    const updateLocal = () => {
      const setter = type === 'main' ? setMainCommittee : setBalavedhiCommittee;
      setter(prev => {
        const index = prev.findIndex(m => m.id === cleanMember.id);
        if (index >= 0) {
          const newArr = [...prev];
          newArr[index] = cleanMember;
          return newArr;
        }
        return [...prev, cleanMember];
      });
    };

    if (!db) { updateLocal(); return; }

    try {
      const colName = type === 'main' ? 'main_committee' : 'balavedhi_committee';
      await setDoc(doc(db, colName, cleanMember.id), cleanMember);
      // Clear error if success
      setDbError(null);
    } catch (e: any) {
      handleError(e);
      updateLocal();
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
      setDbError(null);
    } catch (e: any) {
      handleError(e);
      updateLocal();
    }
  };

  const saveGalleryImage = async (image: GalleryImage) => {
    // Sanitize
    const cleanImage: GalleryImage = {
        id: image.id,
        src: image.src || '',
        alt: image.alt || ''
    };

    const updateLocal = () => {
      setGalleryImages(prev => {
        const index = prev.findIndex(img => img.id === cleanImage.id);
        if (index >= 0) {
           const newArr = [...prev];
           newArr[index] = cleanImage;
           return newArr;
        }
        return [...prev, cleanImage];
      });
    };

    if (!db) { updateLocal(); return; }

    try {
      await setDoc(doc(db, 'gallery', cleanImage.id), cleanImage);
      setDbError(null);
    } catch (e: any) {
      handleError(e);
      updateLocal();
    }
  };

  const deleteGalleryImage = async (id: string) => {
    const updateLocal = () => setGalleryImages(prev => prev.filter(img => img.id !== id));
    
    if (!db) { updateLocal(); return; }

    try {
      await deleteDoc(doc(db, 'gallery', id));
      setDbError(null);
    } catch (e: any) {
      handleError(e);
      updateLocal();
    }
  };

  const saveSiteSettings = async (settings: SiteSettings) => {
    // Sanitize
    const cleanSettings: SiteSettings = {
        title: settings.title || '',
        logo: settings.logo || ''
    };
    
    const updateLocal = () => setSiteSettings(cleanSettings);

    if (!db) { updateLocal(); return; }

    try {
      await setDoc(doc(db, 'settings', 'general'), cleanSettings);
      setDbError(null);
    } catch (e: any) {
      handleError(e);
      updateLocal();
    }
  };
  
  const saveMessage = async (msg: ContactMessage) => {
    if (db) {
       try { await addDoc(collection(db, 'messages'), msg); } 
       catch (e: any) { handleError(e); }
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
      dbError,
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
