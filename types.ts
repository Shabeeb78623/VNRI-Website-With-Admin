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

export interface AppData {
  mainCommittee: CommitteeMember[];
  balavedhiCommittee: CommitteeMember[];
  galleryImages: GalleryImage[];
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
}