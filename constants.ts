
import { CommitteeMember, NavLink, GalleryImage } from './types';

export const NAV_LINKS: NavLink[] = [
  { name: 'Home', href: '#home' },
  { name: 'About Us', href: '#about' },
  { name: 'Committee', href: '#committee' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Contact', href: '#contact' },
];

export const INITIAL_MAIN_COMMITTEE: CommitteeMember[] = [
  { id: 'mc1', name: 'Basheer K', role: 'President', avatarText: 'President', image: '' },
  { id: 'mc2', name: 'Sreejith', role: 'General Secretary', avatarText: 'Secretary', image: '' },
  { id: 'mc3', name: 'Yasar', role: 'Treasurer', avatarText: 'Treasurer', image: '' },
  { id: 'mc4', name: 'Member Name', role: 'Vice President', avatarText: 'Vice President', image: '' },
];

export const INITIAL_BALAVEDHI_COMMITTEE: CommitteeMember[] = [
  { id: 'bc1', name: 'Minha Riyas', role: 'President', avatarText: 'BV President', image: '' },
  { id: 'bc2', name: 'Hishaan Vikas', role: 'General Secretary', avatarText: 'BV Secretary', image: '' },
  { id: 'bc3', name: 'Shabeeb', role: 'Vice president', avatarText: 'BV V.President', image: '' },
  { id: 'bc4', name: 'Iftin Arafath', role: 'Join secretary', avatarText: 'BV J.Secretary', image: '' },
];

export const INITIAL_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'g1', src: 'https://picsum.photos/seed/event1/600/400', alt: 'Community event 1' },
  { id: 'g2', src: 'https://picsum.photos/seed/event2/600/400', alt: 'Cultural program' },
  { id: 'g3', src: 'https://picsum.photos/seed/event3/600/400', alt: 'Sports meet' },
  { id: 'g4', src: 'https://picsum.photos/seed/event4/600/400', alt: 'Social gathering' },
  { id: 'g5', src: 'https://picsum.photos/seed/event5/600/400', alt: 'Charity initiative' },
  { id: 'g6', src: 'https://picsum.photos/seed/event6/600/400', alt: 'Educational seminar' },
  { id: 'g7', src: 'https://picsum.photos/seed/event7/600/400', alt: 'Annual celebration' },
  { id: 'g8', src: 'https://picsum.photos/seed/event8/600/400', alt: 'Members meeting' },
];
