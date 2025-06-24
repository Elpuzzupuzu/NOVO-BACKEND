// client/src/components/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Sección principal del footer */}
        <div className={styles.footerContent}>
          {/* Información de la empresa */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>NOVO Tapicería</h3>
            <p className={styles.footerDescription}>
              Expertos en tapicería automotriz y de muebles. 
              Calidad y tradición.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Enlaces Rápidos</h4>
            <ul className={styles.footerLinks}>
              <li><a href="/servicios">Servicios</a></li>
              <li><a href="/galeria">Galería</a></li>
              <li><a href="/sobre-nosotros">Sobre Nosotros</a></li>
              <li><a href="/contacto">Contacto</a></li>
            </ul>
          </div>

          {/* Servicios principales */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Servicios</h4>
            <ul className={styles.footerLinks}>
              <li>Tapicería Automotriz</li>
              <li>Tapicería de Muebles</li>
              <li>Reparación de Asientos</li>
              <li>Fundas Personalizadas</li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Contacto</h4>
            <div className={styles.contactInfo}>
              <p>📍 Mérida, Yucatán</p>
              <p>📞 (999) 123-4567</p>
              <p>✉️ info@novotapiceria.com</p>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="WhatsApp">💬</a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className={styles.footerDivider}></div>

        {/* Copyright */}
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} NOVO Tapicería. Todos los derechos reservados.</p>
          <p className={styles.footerCredits}>
            By Mimitos ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;