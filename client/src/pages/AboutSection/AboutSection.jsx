// client/src/pages/AboutSection/AboutSection.jsx
import React from 'react';
import styles from './AboutSection.module.css';

const AboutSection = () => {
  return (
    <section id="projects" className={styles.aboutSection}> {/* Añadimos ID para navegación */}
      <h2 className={styles.sectionTitle}>NUESTROS PROYECTOS Y ARTESANÍA</h2> {/* De 'STLE LOSPRATION' */}
      <div className={styles.contentGrid}>
        <div className={styles.imageGallery}>
          {/* Aquí irían las imágenes de la parte inferior */}
          <div className={styles.imagePlaceholder}>
            {/* <img src="/public/project1.jpg" alt="Interior de Lujo Restaurado" /> }
            <p>Restauración de Piel</p>
          </div>
          <div className={styles.imagePlaceholder}>
            {/* <img src="/public/project2.jpg" alt="Diseño Personalizado de Interiores" /> */}
            <p>Diseño Personalizado</p>
          </div>
          <div className={styles.imagePlaceholder}>
            {/* <img src="/public/project3.jpg" alt="Detalles en Acabados Premium" /> */}
            <p>Acabados Premium</p>
          </div>
        </div>
        <div className={styles.textContent}>
          <p className={styles.description}>
            En **NOVO Tapicería**, cada vehículo es una obra maestra en potencia. Nos dedicamos a revivir y personalizar interiores, utilizando solo los materiales más finos y técnicas artesanales que garantizan un acabado de lujo y durabilidad.
          </p>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>✨</span> {/* Icono más representativo */}
            <p>
              **Excelencia Artesanal:** Nuestros expertos tapiceros en Mérida, Yucatán, dedican pasión y precisión a cada puntada, transformando su visión en una realidad tangible.
            </p>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>⭐</span> {/* Otro icono */}
            <p>
              **Materiales Premium:** Seleccionamos cuero genuino, alcántara y telas de la más alta calidad para asegurar un interior que no solo se ve, sino que se siente inigualable.
            </p>
          </div>
          {/* Aquí puedes añadir más "featureItems" */}
          <div className={styles.imageWithText}>
            {/* <img src="/public/small-merida.jpg" alt="Mérida, Yucatán" className={styles.smallImage} /> */}
            <div className={styles.imageTextPlaceholder}>
              <p>Experiencia y Calidad</p> {/* De 'Reol Adce N' */}
              <p>Hecho en Mérida, Yucatán</p> {/* De 'Ool Adce n' */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;