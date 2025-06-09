// client/src/pages/HeroSection/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import ServicesForm from '../../components/ServicesForm/ServicesForm';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const handleCTAClick = (action) => {
    // Aquí puedes agregar lógica para manejar los clicks
    console.log(`Acción: ${action}`);
  };

  return (
    <section 
      className={`${styles.heroSection} ${isVisible ? styles.visible : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Overlay dinámico con gradiente */}
      <div 
        className={styles.overlay}
        style={{
          '--mouse-x': `${mousePosition.x}%`,
          '--mouse-y': `${mousePosition.y}%`
        }}
      ></div>
      
      {/* Elementos decorativos flotantes */}
      <div className={styles.floatingElements}>
        <div className={styles.floatingElement}></div>
        <div className={styles.floatingElement}></div>
        <div className={styles.floatingElement}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.textContainer}>
          {/* Badge superior */}
          <div className={styles.badge}>
            <span className={styles.badgeText}>✨ ARTESANÍA PREMIUM</span>
          </div>

          <h1 className={styles.mainTitle}>
            <span className={styles.titleLine}>ELEVA EL LUJO</span>
            <span className={styles.titleLine}>DE TU AUTO</span>
            <span className={`${styles.titleLine} ${styles.highlight}`}>
              CON TAPICERÍA EXCLUSIVA
            </span>
          </h1>

          <p className={styles.description}>
            En <strong>NOVO Tapicería</strong>, transformamos el interior de vehículos de gama 
            media a alta en obras de arte personalizadas. Experimenta la artesanía superior 
            y la atención meticulosa al detalle que solo encontrarás en Mérida, Yucatán.
          </p>

          {/* Características destacadas */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🏆</span>
              <span>Calidad Premium</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⚡</span>
              <span>Servicio Rápido</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🎨</span>
              <span>Diseño Personalizado</span>
            </div>
          </div>

          <div className={styles.buttons}>
            <button 
              className={styles.ctaButtonPrimary}
              onClick={() => handleCTAClick('cotización')}
            >
              <span className={styles.buttonText}>SOLICITAR COTIZACIÓN</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
            <button 
              className={styles.ctaButtonSecondary}
              onClick={() => handleCTAClick('proyectos')}
            >
              <span className={styles.buttonText}>VER PROYECTOS</span>
              <span className={styles.buttonIcon}>🎯</span>
            </button>
          </div>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.formContainer}>
            <h3 className={styles.formTitle}>Cotización Instantánea</h3>
            <ServicesForm /> */aqui voy a hacer las pruebas*/
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollText}>Descubre más</div>
        <div className={styles.scrollArrow}></div>
      </div>
    </section>
  );
};

export default HeroSection;