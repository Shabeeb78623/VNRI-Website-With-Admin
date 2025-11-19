
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Contact: React.FC = () => {
  const { saveMessage } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      await saveMessage({
        ...formData,
        timestamp: Date.now()
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      // Reset success message after 3 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

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
          {status === 'success' && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Thank you!</strong>
              <span className="block sm:inline"> Your message has been sent successfully.</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> Something went wrong. Please try again later.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                autoComplete="name" 
                required 
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Full name" 
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                autoComplete="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Email address" 
              />
            </div>
            <div>
              <label htmlFor="message" className="sr-only">Message</label>
              <textarea 
                id="message" 
                name="message" 
                rows={4} 
                required 
                value={formData.message}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Your Message"
              ></textarea>
            </div>
            <div>
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-blue-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;