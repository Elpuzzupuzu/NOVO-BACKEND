// client/src/components/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} NOVO Tapicería. Todos los derechos reservados.</p>
      {/* Puedes añadir más enlaces o información aquí */}
    </footer>
  );
};

export default Footer; // <--- ¡Asegúrate de que esta línea esté presente y correcta!