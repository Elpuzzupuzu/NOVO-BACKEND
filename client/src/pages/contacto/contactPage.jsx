import React, { useState } from 'react';
import styles from './ContactPage.module.css'; // Importa los estilos CSS Modules
import Footer from '../../components/Footer/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simular envío del formulario
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        serviceType: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Ubicación',
      info: 'Av. Paseo de Montejo 456, Centro Histórico',
      subInfo: 'Mérida, Yucatán, México 97000'
    },
    {
      icon: '📞',
      title: 'Teléfono',
      info: '(999) 123-4567',
      subInfo: 'Lunes a Viernes: 9:00 AM - 6:00 PM'
    },
    {
      icon: '✉️',
      title: 'Email',
      info: 'contacto@tapiceriapremium.com',
      subInfo: 'Respuesta en menos de 24 horas'
    },
    {
      icon: '🕒',
      title: 'Horarios',
      info: 'Lun - Vie: 9:00 AM - 6:00 PM',
      subInfo: 'Sáb: 9:00 AM - 2:00 PM'
    }
  ];

  const services = [
    'Consulta de Diseño',
    'Tapicería de Muebles',
    'Muebles Personalizados',
    'Restauración',
    'Decoración de Interiores',
    'Otro'
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>
            Contáctanos
          </h1>
          <p className={styles.headerSubtitle}>
            Estamos aquí para hacer realidad tu visión de tapicería de alta gama.
            Contáctanos para una consulta personalizada.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.gridContainer}>
          {/* Información de Contacto */}
          <div>
            <h2 className={styles.contactInfoSectionTitle}>
              Información de Contacto
            </h2>
            <div className={styles.contactInfoGrid}>
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className={styles.contactInfoCard}
                  // Aquí mantendremos los onMouseEnter y onMouseLeave para interactividad directa
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffd700';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className={styles.contactInfoCardContent}>
                    <span className={styles.contactInfoIcon}>{item.icon}</span>
                    <div>
                      <h3 className={styles.contactInfoTitle}>
                        {item.title}
                      </h3>
                      <p className={styles.contactInfoText}>
                        {item.info}
                      </p>
                      <p className={styles.contactInfoSubText}>
                        {item.subInfo}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mapa placeholder */}
            <div className={styles.mapPlaceholder}>
              <h3 className={styles.contactInfoTitle}>
                📍 Encuéntranos
              </h3>
              <div className={styles.mapPlaceholderContent}>
                <p>Mapa interactivo - Showroom en Centro Histórico</p>
              </div>
            </div>
          </div>

          {/* Formulario de Contacto */}
          <div>
            <h2 className={styles.formSectionTitle}>
              Envíanos un Mensaje
            </h2>

            <div className={styles.formContainer}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="serviceType" className={styles.formLabel}>
                    Tipo de Servicio
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="">Selecciona un servicio</option>
                    {services.map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.formLabel}>
                  Asunto *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.formLabel}>
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Cuéntanos sobre tu proyecto de tapicería..."
                  className={styles.formTextarea}
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={styles.submitButton}
                // Aquí también mantenemos la interactividad directa para el botón
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#ffed4e';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#ffd700';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner} />
                    Enviando...
                  </>
                ) : (
                  '✉️ Enviar Mensaje'
                )}
              </button>

              {submitStatus === 'success' && (
                <div className={styles.successMessage}>
                  ✅ ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className={styles.errorMessage}>
                  ❌ Error al enviar el mensaje. Inténtalo nuevamente.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de servicios destacados */}
        <div className={styles.whyChooseUsSection}>
          <h2 className={styles.whyChooseUsTitle}>
            ¿Por qué elegirnos?
          </h2>
          <div className={styles.featuresGrid}>
            {[
              { icon: '✨', title: 'Materiales Premium', desc: 'Solo las mejores telas y materiales' },
              { icon: '🎨', title: 'Diseño Personalizado', desc: 'Cada pieza única y a medida' },
              { icon: '🚚', title: 'Servicio Completo', desc: 'Desde diseño hasta instalación' }
            ].map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>
                  {feature.title}
                </h3>
                <p className={styles.featureDescription}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer/>

    </div>
  );
};

export default ContactPage;