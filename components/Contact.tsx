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
      // 1. Send Email via FormSubmit (Free Service)
      // We use fetch to do this silently without redirecting the page
      const emailResponse = await fetch("https://formsubmit.co/ajax/shabeebkk@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Message from VNRI Website: ${formData.name}`,
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      });

      // 2. Save to Firestore Database (Backup)
      await saveMessage({
        ...formData,
        timestamp: Date.now()
      });

      if (emailResponse.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        throw new Error('Email service failed');
      }

    } catch (error) {
      console.error("Contact form error:", error);
      // Even if email fails, if Firestore worked, we can consider it mostly a success, 
      // but for now let's show error so user tries again.
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900">Get In Touch</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you! Reach out for inquiries, membership details, or just to say hello.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
          {status === 'success' && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-4 rounded shadow-sm animate-fade-in">
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <strong className="font-bold mr-1">Thank you!</strong>
                <span>Your message has been sent to our team.</span>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded shadow-sm animate-fade-in">
               <div className="flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <strong className="font-bold mr-1">Oops!</strong>
                <span>Something went wrong. Please try again.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden Inputs for FormSubmit Configuration */}
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />

            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                autoComplete="name" 
                required 
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="Enter your name" 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                autoComplete="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="Enter your email" 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</label>
              <textarea 
                id="message" 
                name="message" 
                rows={5} 
                required 
                value={formData.message}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <div>
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-lg text-lg font-bold text-blue-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all transform hover:-translate-y-1 ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;