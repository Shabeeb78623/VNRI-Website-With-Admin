import React from 'react';
import { useApp } from '../context/AppContext';

const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  const handleSecretClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('admin');
  };

  return (
    <footer className="bg-blue-950 text-blue-200 border-t border-blue-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Side: Copyright */}
          <div className="flex items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-white tracking-wide">Vadakara <span className="text-yellow-500">NRI Forum</span></p>
              <p className="text-sm text-gray-400 font-medium mt-1">Abu Dhabi, UAE</p>
              <p className="text-xs opacity-60 mt-2">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
            </div>
          </div>

          {/* Right Side: Credits & Contact */}
          <div className="flex flex-col items-center md:items-end space-y-2">
             <div className="flex flex-col items-center md:items-end">
               <span className="text-xs uppercase tracking-widest text-blue-400 mb-1">Website Developed By</span>
               <button 
                onClick={handleSecretClick}
                className="text-lg font-bold text-white hover:text-yellow-400 transition-colors"
               >
                Shabeeb K.K
               </button>
               <a 
                 href="mailto:shabeebkk@gmail.com" 
                 className="text-sm text-yellow-500 hover:text-yellow-300 transition-colors flex items-center gap-1 mt-1"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                 </svg>
                 shabeebkk@gmail.com
               </a>
             </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;