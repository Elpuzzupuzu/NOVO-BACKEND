// client/src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleContactClick = () => {
    // Puedes personalizar esto según tus necesidades:
    // - Scroll a sección de contacto
    // - Abrir modal de contacto
    // - Redirigir a página de contacto
    scrollToSection('contact');
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.logoContainer}>
        <img 
          src="/novologo.jpg" 
          alt="NOVO Tapicería Logo" 
          className={styles.logoImage}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className={styles.logoText}>
          <span className={styles.mainLogo}>NOVO</span>
          <span className={styles.subLogo}>Tapicería de Lujo</span>
        </div>
      </div>

      {/* Hamburger Menu Button */}
      <button 
        className={styles.hamburger}
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <button 
              onClick={() => scrollToSection('about')} 
              className={styles.navLink}
            >
              NOSOTROS
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              onClick={() => scrollToSection('services')} 
              className={styles.navLink}
            >
              SERVICIOS
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              onClick={() => scrollToSection('projects')} 
              className={styles.navLink}
            >
              PROYECTOS
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              onClick={handleContactClick}
              className={styles.ctaButton}
            >
              CONTACTO
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;