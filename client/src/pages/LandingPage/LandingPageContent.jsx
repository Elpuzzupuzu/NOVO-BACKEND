// client/src/pages/LandingPage/LandingPageContent.jsx
import React from 'react';
import Header from '../../components/Header/Header';
import HeroSection from '../HeroSection/HeroSection';
import AboutSection from '../AboutSection/AboutSection';
import Footer from '../../components/Footer/Footer';
// *** AÑADE ESTA LÍNEA ***
import styles from './LandingPageContent.module.css'; // O '../App.module.css' si no lo renombraste y está en el mismo nivel
                                                   // o './App.module.css' si tu App.module.css original sigue ahí
                                                   // y quieres usarlo para este componente.

function LandingPageContent() {
  return (
    <div className={styles.appContainer}>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPageContent;