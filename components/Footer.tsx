
import React from 'react';
import { useApp } from '../context/AppContext';

const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  const handleSecretClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('admin');
  };

  return (
    <footer className="bg-blue-900 text-blue-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center relative">
        <p>&copy; {new Date().getFullYear()} Vadakara NRI Forum Abu Dhabi. All Rights Reserved.</p>
        <div className="absolute bottom-4 right-4">
           <button 
            onClick={handleSecretClick}
            className="bg-yellow-500 text-blue-900 text-xs font-semibold px-3 py-1 rounded-full hover:bg-yellow-400 transition-all duration-300 shadow cursor-pointer"
           >
            Made by Shabeeb K.K
           </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
