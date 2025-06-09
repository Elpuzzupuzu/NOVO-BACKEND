// client/src/pages/AboutSection/AboutSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './AboutSection.module.css';

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const sectionRef = useRef(null);

  const portfolioImages = [
    {
      src: '/about1.jpg',
      alt: 'Interior de lujo BMW renovado',
      title: 'BMW Serie 7',
      category: 'Sedán Premium'
    },
    {
      src: '/hero2.jpg', 
      alt: 'Tapicería artesanal Mercedes',
      title: 'Mercedes Clase S',
      category: 'Lujo Ejecutivo'
    },
    {
      src: '/about3.jpg',
      alt: 'Restauración completa Audi',
      title: 'Audi A8',
      category: 'Deportivo Premium'
    }
  ];

  const features = [
    {
      icon: '🏆',
      title: 'Experiencia Premium',
      description: 'Más de 15 años transformando interiores de vehículos de alta gama con técnicas artesanales únicas.',
      highlight: '15+ años'
    },
    {
      icon: '⚡',
      title: 'Tecnología Avanzada',
      description: 'Utilizamos equipos de última generación y materiales importados de la más alta calidad.',
      highlight: 'Tecnología de punta'
    },
    {
      icon: '🎨',
      title: 'Diseño Personalizado',
      description: 'Cada proyecto es único, diseñado específicamente para reflejar el estilo y personalidad del cliente.',
      highlight: '100% personalizado'
    }
  ];

  const stats = [
    { number: '500+', label: 'Proyectos Completados' },
    { number: '98%', label: 'Satisfacción Cliente' },
    { number: '15+', label: 'Años de Experiencia' },
    { number: '24h', label: 'Servicio Express' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % portfolioImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [portfolioImages.length]);

  return (
    <section 
      ref={sectionRef}
      className={`${styles.aboutSection} ${isVisible ? styles.visible : ''}`}
    >
      {/* Header Section */}
      <div className={styles.header}>
        <span className={styles.badge}>✨ NUESTRO LEGADO</span>
        <h2 className={styles.sectionTitle}>
          ARTESANÍA QUE DEFINE
          <span className={styles.highlight}> EXCELENCIA</span>
        </h2>
        <p className={styles.subtitle}>
          Transformamos vehículos ordinarios en obras maestras de lujo y confort, 
          donde cada detalle cuenta una historia de perfección artesanal.
        </p>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statNumber}>{stat.number}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid - Solo galería y features */}
      <div className={styles.contentGrid}>
        {/* Image Gallery */}
        <div className={styles.imageSection}>
          <div className={styles.featuredImage}>
            <img 
              src={portfolioImages[activeImageIndex].src} 
              alt={portfolioImages[activeImageIndex].alt}
              className={styles.mainImage}
            />
            <div className={styles.imageOverlay}>
              <h4 className={styles.imageTitle}>
                {portfolioImages[activeImageIndex].title}
              </h4>
              <p className={styles.imageCategory}>
                {portfolioImages[activeImageIndex].category}
              </p>
            </div>
          </div>
          
          <div className={styles.thumbnailGrid}>
            {portfolioImages.map((image, index) => (
              <div 
                key={index}
                className={`${styles.thumbnail} ${
                  index === activeImageIndex ? styles.activeThumbnail : ''
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={image.src} alt={image.alt} />
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.featuresContent}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureHeader}>
                  <span className={styles.featureIcon}>{feature.icon}</span>
                  <div>
                    <h4 className={styles.featureTitle}>{feature.title}</h4>
                    <span className={styles.featureHighlight}>{feature.highlight}</span>
                  </div>
                </div>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section - Ahora debajo de la galería */}
      <div className={styles.storySection}>
        <div className={styles.story}>
          <h3 className={styles.storyTitle}>Nuestra Historia</h3>
          <div className={styles.storyContent}>
            <p className={styles.storyText}>
              En <strong>NOVO Tapicería</strong>, cada hilo cuenta una historia de pasión 
              y dedicación. Desde nuestros inicios en Mérida, Yucatán, hemos forjado una 
              reputación basada en la excelencia artesanal y la innovación constante.
            </p>
            <p className={styles.storyText}>
              Nos especializamos en transformar interiores de vehículos premium, 
              combinando técnicas tradicionales con tecnología de vanguardia para 
              crear experiencias únicas de lujo y confort.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={styles.ctaContainer}>
        <div className={styles.ctaSection}>
          <div className={styles.founder}>
            <div className={styles.founderImage}>
              <img src="/founder.jpg" alt="Fundador NOVO Tapicería" />
            </div>
            <div className={styles.founderInfo}>
              <h4 className={styles.founderName}>Diego Armando Aguilar Perez</h4>
              <p className={styles.founderTitle}>Fundador</p>
              <p className={styles.founderQuote}>
                "Cada proyecto es una oportunidad de crear algo extraordinario"
              </p>
            </div>
          </div>
          
          <button className={styles.ctaButton}>
            <span>Conoce Nuestro Proceso</span>
            <span className={styles.ctaIcon}>→</span>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className={styles.decorativeElements}>
        <div className={styles.decorativeCircle}></div>
        <div className={styles.decorativeLine}></div>
      </div>
    </section>
  );
};

export default AboutSection;