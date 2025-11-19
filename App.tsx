import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Leadership from './components/Leadership';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/Admin/AdminPanel';

const MainContent: React.FC = () => (
  <div className="bg-gray-50 text-gray-800">
    <Header />
    <main>
      <Hero />
      <About />
      <Leadership />
      <Gallery />
      <Contact />
    </main>
    <Footer />
  </div>
);

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center">
    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <h2 className="text-white text-xl font-bold tracking-wide">VNRI FORUM</h2>
    <p className="text-blue-200 text-sm mt-2">Loading community data...</p>
  </div>
);

const AppRouter: React.FC = () => {
  const { currentView, isLoading } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {currentView === 'home' ? <MainContent /> : <AdminPanel />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;