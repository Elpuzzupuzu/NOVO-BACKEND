// client/src/components/Header/Header.jsx
import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        {/* Aquí puedes usar una imagen de logo si la tienes en /public/logo.png o /src/assets/images/logo.png */}
        {/* <img src="/logo.png" alt="NOVO Tapicería Logo" className={styles.logoImage} /> */}
        <span className={styles.mainLogo}>NOVO</span>
        <span className={styles.subLogo}>Tapicería de Lujo</span> {/* De 'Tapiceria.' */}
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}><a href="#about" className={styles.navLink}>NOSOTROS</a></li>       {/* De 'ABOUT INE' */}
          <li className={styles.navItem}><a href="#services" className={styles.navLink}>SERVICIOS</a></li>     {/* De 'FOR LUSS' */}
          <li className={styles.navItem}><a href="#projects" className={styles.navLink}>PROYECTOS</a></li>    {/* De 'ADOGIST' */}
          <li className={styles.navItem}>
            <button className={styles.ctaButton}>CONTACTO</button> {/* De 'Coaglt' */}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;