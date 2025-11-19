
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
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Side: Logo and Copyright */}
          <div className="flex items-center gap-4">
            {/* Logo in footer */}
            <img src="/logo.png" alt="VNRI Logo" className="h-12 w-auto" />
            <div className="text-center md:text-left">
              <p className="font-semibold text-white">Vadakara NRI Forum Abu Dhabi</p>
              <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
            </div>
          </div>

          {/* Right Side: Credits & Secret Admin Button */}
          <div className="flex flex-col items-center md:items-end space-y-1">
             <div className="flex flex-col items-center md:items-end text-sm">
               <span className="text-blue-300">Website developed by</span>
               <button 
                onClick={handleSecretClick}
                className="font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
               >
                Shabeeb K.K
               </button>
               <a 
                 href="mailto:shabeebkk@gmail.com" 
                 className="text-xs text-blue-400 hover:text-white transition-colors mt-1"
               >
                 Email: shabeebkk@gmail.com
               </a>
             </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;