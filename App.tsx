
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

const AppRouter: React.FC = () => {
  const { currentView } = useApp();

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
