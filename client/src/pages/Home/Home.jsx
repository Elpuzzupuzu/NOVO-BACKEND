// client/src/pages/Home/Home.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import Header from '../../components/Header/Header'; // <--- ¡Importa el Header!
import styles from './Home.module.css';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Redirigir a la Landing Page si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!isAuthenticated) {
    return <p>Redirigiendo...</p>;
  }

  return (
    // Envuelve el contenido en un contenedor, por ejemplo, un div principal
    <div className={styles.homeWrapper}> {/* Puedes añadir un nuevo estilo para este wrapper si lo necesitas */}
      <Header/> {/* <--- ¡Coloca el Header aquí! */}
      <div className={styles.homeContainer}> {/* Tu contenedor actual de contenido */}
        <h1 className={styles.welcomeTitle}>
          ¡Bienvenido, {user?.nombre || user?.username}!
        </h1>
        <p className={styles.userInfo}>Has iniciado sesión como **{user?.role}**.</p>
        <p className={styles.message}>
          Desde aquí podrás gestionar tu sistema de tapicería de alta gama.
        </p>
        {/* Aquí podrías añadir enlaces a otras secciones, dashboard, etc. */}
        <button className={styles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Home;