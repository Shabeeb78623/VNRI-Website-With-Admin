
export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  image?: string; // Base64 string
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface NavLink {
  name: string;
  href: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  timestamp: number;
}

export interface SiteSettings {
  title: string;
  logo: string; // Base64 string
  favicon?: string; // Base64 string
}

export interface AppData {
  mainCommittee: CommitteeMember[];
  balavedhiCommittee: CommitteeMember[];
  galleryImages: GalleryImage[];
  siteSettings: SiteSettings;
}

export interface AppContextType {
  data: AppData;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  currentView: 'home' | 'admin';
  navigateTo: (view: 'home' | 'admin') => void;
  
  // New CRUD methods for Firestore
  saveMember: (type: 'main' | 'balavedhi', member: CommitteeMember) => Promise<void>;
  deleteMember: (type: 'main' | 'balavedhi', id: string) => Promise<void>;
  saveGalleryImage: (image: GalleryImage) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  saveMessage: (msg: ContactMessage) => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
}
