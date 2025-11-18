
export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  image?: string; // Base64 string or URL
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
  updateData: (newData: AppData) => void;
  isAuthenticated: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  currentView: 'home' | 'admin';
  navigateTo: (view: 'home' | 'admin') => void;
}
