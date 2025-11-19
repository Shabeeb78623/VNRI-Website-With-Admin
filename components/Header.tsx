import React, { useState } from 'react';
import { NAV_LINKS } from '../constants';
import type { NavLink } from '../types';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderNavLinks = (links: NavLink[], className: string) => (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.name}>
          <a 
            href={link.href} 
            className="text-white hover:text-yellow-400 transition-colors duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="bg-blue-800/95 backdrop-blur-sm shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0 flex items-center py-2">
            <a href="#home" className="text-2xl md:text-3xl font-bold tracking-wide hover:opacity-90 transition-opacity">
              <span className="text-white">Vadakara</span> <span className="text-yellow-400">NRI Forum</span>
            </a>
          </div>
          <div className="hidden md:block">
            <nav className="flex items-center space-x-8">
              {renderNavLinks(NAV_LINKS, 'flex items-baseline space-x-6')}
              <a
                href="https://shabeeb.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 text-blue-900 font-bold px-5 py-2.5 rounded-full hover:bg-yellow-400 transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
              >
                Membership Portal
              </a>
            </nav>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-yellow-400 focus:outline-none p-2"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-blue-900 border-t border-blue-700">
          <nav className="px-4 pt-4 pb-6 space-y-2 text-center">
            {renderNavLinks(NAV_LINKS, 'flex flex-col space-y-4 py-4')}
            <a
              href="https://shabeeb.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-yellow-500 text-blue-900 font-bold px-6 py-3 rounded-full hover:bg-yellow-400 transition-all duration-300 shadow mt-4"
            >
              Membership Portal
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;