
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
    <header className="bg-blue-800/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0 flex items-center">
            {/* Replaced text with Logo. Requires 'logo.png' in public folder */}
            <a href="#home" className="block">
              <img src="/logo.png" alt="Vadakara NRI Forum" className="h-20 w-auto object-contain" />
            </a>
          </div>
          <div className="hidden md:block">
            <nav className="flex items-center space-x-8">
              {renderNavLinks(NAV_LINKS, 'flex items-baseline space-x-6')}
              <a
                href="https://shabeeb.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 text-blue-900 font-semibold px-4 py-2 rounded-md hover:bg-yellow-400 transition-all duration-300 shadow"
              >
                Membership Portal
              </a>
            </nav>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-yellow-400 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="md:hidden bg-blue-800">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            {renderNavLinks(NAV_LINKS, 'flex flex-col space-y-4 py-4')}
            <a
              href="https://shabeeb.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-yellow-500 text-blue-900 font-semibold px-4 py-2 rounded-md hover:bg-yellow-400 transition-all duration-300 shadow mx-auto w-fit"
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