// client/src/pages/Home/Home.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import AuthHeader from '../../components/User/AuthHeader/AuthHeader';
import Footer from '../../components/Footer/Footer';
import styles from './Home.module.css';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir a la Landing Page si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading || (!isAuthenticated && !loading)) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Cargando...</p>
      </div>
    );
  }

  // Servicios disponibles para el cliente
  const clientServices = [
    { 
      label: 'Catálogo de Productos', 
      path: '/catalog', 
      icon: '🛋️', 
      description: 'Explora nuestra colección de tapicería premium'
    },
    { 
      label: 'Mis Pedidos', 
      path: '/orders', 
      icon: '📦', 
      description: 'Revisa el estado de tus órdenes'
    },
    { 
      label: 'Solicitar Cotización', 
      path: '/quote', 
      icon: '💰', 
      description: 'Obtén un presupuesto personalizado'
    },
    { 
      label: 'Galería de Proyectos', 
      path: '/gallery', 
      icon: '🖼️', 
      description: 'Inspírate con nuestros trabajos realizados'
    },
    { 
      label: 'Agendar Cita', 
      path: '/appointment', 
      icon: '📅', 
      description: 'Programa una visita a nuestro showroom'
    },
    { 
      label: 'Mi Perfil', 
      path: '/profile', 
      icon: '👤', 
      description: 'Gestiona tu información personal'
    }
  ];

  return (
    <div className={styles.homeWrapper}>
      <AuthHeader />
      
      <main className={styles.homeContainer}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            {getGreeting()}, {user?.nombre || user?.username}
          </h1>
          
          <div className={styles.userInfo}>
            <p>Bienvenido a tu <strong>Portal de Cliente</strong></p>
            {user?.email && (
              <p className={styles.userEmail}>{user.email}</p>
            )}
          </div>
        </div>

        <div className={styles.contentSection}>
          <p className={styles.message}>
            Descubre nuestro mundo de tapicería de alta gama. Desde muebles elegantes hasta 
            soluciones personalizadas para tu hogar u oficina, estamos aquí para hacer realidad tu visión.
          </p>

          {/* Servicios para el cliente */}
          <div className={styles.servicesSection}>
            <h3 className={styles.sectionTitle}>¿Qué te gustaría hacer hoy?</h3>
            <div className={styles.servicesGrid}>
              {clientServices.map((service, index) => (
                <div
                  key={index}
                  className={styles.serviceCard}
                  onClick={() => navigate(service.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(service.path);
                    }
                  }}
                >
                  <span className={styles.serviceIcon}>{service.icon}</span>
                  <h4 className={styles.serviceTitle}>{service.label}</h4>
                  <p className={styles.serviceDescription}>{service.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Información destacada para el cliente */}
          <div className={styles.highlightSection}>
            <div className={styles.promoCard}>
              <h3 className={styles.promoTitle}>🌟 Oferta Especial</h3>
              <p className={styles.promoText}>
                Consulta gratuita de diseño para nuevos proyectos de tapicería
              </p>
              <button 
                className={styles.promoButton}
                onClick={() => navigate('/quote')}
              >
                Solicitar Ahora
              </button>
            </div>
            
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>📞 Atención al Cliente</h3>
              <p className={styles.infoText}>
                ¿Tienes dudas? Nuestro equipo está disponible de lunes a viernes
              </p>
              <div className={styles.contactInfo}>
                <p>📱 Tel: (999) 123-4567</p>
                <p>✉️ contacto@tapiceria.com</p>
              </div>
            </div>
          </div>

          {/* Resumen de actividad del cliente */}
          <div className={styles.activitySummary}>
            <h3 className={styles.sectionTitle}>Tu Actividad Reciente</h3>
            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryIcon}>📦</span>
                <div className={styles.summaryContent}>
                  <h4>Pedidos Activos</h4>
                  <p className={styles.summaryNumber}>2</p>
                </div>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryIcon}>💰</span>
                <div className={styles.summaryContent}>
                  <h4>Cotizaciones Pendientes</h4>
                  <p className={styles.summaryNumber}>1</p>
                </div>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryIcon}>⭐</span>
                <div className={styles.summaryContent}>
                  <h4>Proyectos Completados</h4>
                  <p className={styles.summaryNumber}>5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.logoutSection}>
          <button 
            className={`${styles.logoutButton} ${isLoading ? styles.loading : ''}`}
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.buttonSpinner}></span>
                Cerrando sesión...
              </>
            ) : (
              'Cerrar Sesión'
            )}
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;