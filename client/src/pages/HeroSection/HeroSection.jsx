// client/src/pages/HeroSection/HeroSection.jsx
import React from 'react';
import ServicesForm from '../../components/ServicesForm/ServicesForm';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <div className={styles.textContainer}>
          <h1 className={styles.mainTitle}>
            ELEVA EL LUJO DE TU AUTO <br /> CON TAPICERÍA EXCLUSIVA
          </h1>
          <p className={styles.description}>
            En **NOVO Tapicería**, transformamos el interior de vehículos de gama media a alta en obras de arte personalizadas. Experimenta la artesanía superior y la atención meticulosa al detalle que solo encontrarás en Mérida, Yucatán.
          </p>
          <div className={styles.buttons}>
            <button className={styles.ctaButtonPrimary}>SOLICITAR COTIZACIÓN</button> {/* De 'Catc Now!' */}
            <button className={styles.ctaButtonSecondary}>VER PROYECTOS</button>      {/* De 'Batr Like' */}
          </div>
        </div>
        <div className={styles.formWrapper}>
          <ServicesForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;