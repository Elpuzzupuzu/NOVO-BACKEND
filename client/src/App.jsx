// client/src/App.jsx
import React from 'react';
import Header from './components/Header/Header';
import HeroSection from './pages/HeroSection/HeroSection'; // Lo ubicaremos en pages por ser una sección principal
import AboutSection from './pages/AboutSection/AboutSection'; // Lo ubicaremos en pages
import Footer from './components/Footer/Footer'; // Componente genérico
import styles from './App.module.css'; // Para estilos generales de App

function App() {
  return (
    <div className={styles.appContainer}>
      <Header />
      <main> {/* Usa la etiqueta <main> para el contenido principal */}
        <HeroSection />
        <AboutSection />
        {/* Aquí podrías añadir más secciones si el diseño lo requiere */}
      </main>
      <Footer />
    </div>
  );
}

export default App;