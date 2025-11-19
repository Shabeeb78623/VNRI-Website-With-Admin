
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-40 md:py-56 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to
        </h1>
        <h2 className="text-yellow-400 text-5xl md:text-7xl font-extrabold mt-2">
          Vadakara NRI Forum Abu Dhabi
        </h2>
        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-blue-100">
          Celebrating 20 Years of Togetherness. Connecting our community, fostering our culture, and supporting each other in the UAE.
        </p>
        <div className="mt-10">
          <a
            href="https://shabeeb.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 text-blue-900 font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
          >
            Join Our Community
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;