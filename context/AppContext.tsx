
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppContextType, AppData } from '../types';
import { INITIAL_MAIN_COMMITTEE, INITIAL_BALAVEDHI_COMMITTEE, INITIAL_GALLERY_IMAGES } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Data State (The "Backend" Database) ---
  const [data, setData] = useState<AppData>({
    mainCommittee: INITIAL_MAIN_COMMITTEE,
    balavedhiCommittee: INITIAL_BALAVEDHI_COMMITTEE,
    galleryImages: INITIAL_GALLERY_IMAGES,
  });

  // Load data from LocalStorage on mount (Persistence)
  useEffect(() => {
    const savedData = localStorage.getItem('vnri_app_data');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  const updateData = (newData: AppData) => {
    setData(newData);
    localStorage.setItem('vnri_app_data', JSON.stringify(newData));
  };

  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (u: string, p: string) => {
    if (u === 'Shabeeb' && p === 'ShabeeB@2025') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigateTo('home');
  };

  // --- View/Navigation State ---
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');

  const navigateTo = (view: 'home' | 'admin') => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <AppContext.Provider value={{ 
      data, 
      updateData, 
      isAuthenticated, 
      login, 
      logout, 
      currentView, 
      navigateTo 
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
