
import React from 'react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-blue-800">Get In Touch</h2>
          <p className="mt-4 text-lg text-gray-600">
            We'd love to hear from you! Reach out for inquiries or membership details.
          </p>
        </div>
        <div className="mt-12 max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
          <form action="#" method="POST" className="space-y-6">
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input type="text" name="name" id="name" autoComplete="name" required className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Full name" />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input type="email" name="email" id="email" autoComplete="email" required className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="message" className="sr-only">Message</label>
              <textarea id="message" name="message" rows={4} required className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Your Message"></textarea>
            </div>
            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-blue-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
