
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-blue-800">About Us</h2>
        <p className="mt-4 text-lg text-gray-600">Our Mission, Vision, and Story</p>
        <div className="mt-8 text-left space-y-6 text-gray-700 leading-relaxed">
          <p>
            Vadakara NRI Forum Abu Dhabi is a vibrant community organization dedicated to bringing together expatriates from Vadakara and surrounding regions. Established over two decades ago, our forum serves as a home away from home, fostering a strong sense of unity, culture, and mutual support among our members.
          </p>
          <p>
            Our mission is to promote social, cultural, and welfare activities, nurturing our traditional values while embracing the dynamic life of Abu Dhabi. We organize numerous events throughout the year, including cultural festivals, sports meets, educational programs, and charitable initiatives.
          </p>
          <p>
            We are proud of our "20 Years of Togetherness" and look forward to many more years of serving our community, strengthening our bonds, and creating lasting memories.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
