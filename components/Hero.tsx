import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="bg-gradient-to-b from-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-down">
          Welcome to
        </h1>
        <h2 className="text-yellow-400 text-5xl md:text-7xl font-extrabold mt-4 drop-shadow-lg">
          Vadakara NRI Forum Abu Dhabi
        </h2>
        <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-blue-100 leading-relaxed">
          Celebrating 20 Years of Togetherness. Connecting our community, fostering our culture, and supporting each other in the UAE.
        </p>
        <div className="mt-12">
          <a
            href="https://shabeeb.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 text-blue-900 font-extrabold px-10 py-4 rounded-full text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-block border-2 border-yellow-600"
          >
            Join Our Community
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;