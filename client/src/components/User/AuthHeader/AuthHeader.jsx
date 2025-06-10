// client/src/components/User/AuthHeader/AuthHeader.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../../features/auth/authSlice';
import styles from './AuthHeader.module.css'; // Su CSS modularizado

const AuthHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false); // Nuevo estado para el menú de cuadrícula

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Funciones para alternar la visibilidad de menús/asides
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
    setIsGridMenuOpen(false); // Cierra otros menús
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsGridMenuOpen(false); // Cierra otros menús
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfileMenuOpen(false);
    setIsCartOpen(false);
    setIsGridMenuOpen(false); // Cierra otros menús
  };

  const toggleGridMenu = () => {
    setIsGridMenuOpen(!isGridMenuOpen);
    setIsProfileMenuOpen(false);
    setIsCartOpen(false);
    setIsMobileMenuOpen(false); // Cierra otros menús
  };

  // Manejador para cerrar sesión
  const handleLogout = () => {
    dispatch(logout());
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  // Componente del segundo nivel de navegación (los enlaces de "INICIO", "CONTACTO" etc.)
  // Lo definimos aquí para que el header principal esté limpio
  const SecondaryNav = () => (
    <nav className={styles.secondaryNav}>
      <ul className={styles.secondaryNavList}>
        <li><Link to="/home" className={styles.secondaryNavLink}>INICIO</Link></li>
        <li><Link to="/about-us" className={styles.secondaryNavLink}>ACERCA DE</Link></li> {/* Puedes crear estas rutas */}
        <li><Link to="/products" className={styles.secondaryNavLink}>PRODUCTOS</Link></li>
        <li><Link to="/servicios" className={styles.secondaryNavLink}>SERVICIOS</Link></li>
        <li><Link to="/contact" className={styles.secondaryNavLink}>CONTACTO</Link></li>
      </ul>
    </nav>
  );


  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      {/* Sección Superior del Header */}
      <div className={styles.headerTop}>
        <div className={styles.logoContainer}>
          <Link to="/home" className={styles.logoLink}>
            <img
              src="/novologo.jpg"
              alt="NOVO Tapicería Logo"
              className={styles.logoImage}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className={styles.logoText}>
              <span className={styles.mainLogo}>NOVO</span>
              <span className={styles.subLogo}>Tapicería de Lujo</span>
            </div>
          </Link>
        </div>

        {/* Contenedor central para menú de cuadrícula y búsqueda */}
        <div className={styles.centerSection}>
          <button className={styles.gridMenuButton} onClick={toggleGridMenu} aria-label="Menú de categorías">
            <i className="fas fa-th-large"></i> {/* Icono de cuadrícula */}
          </button>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Buscar productos, servicios..." className={styles.searchInput} />
            <button className={styles.searchButton} aria-label="Buscar">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* Iconos de usuario y carrito */}
        <div className={styles.userIcons}>
          <button className={styles.navIcon} onClick={toggleCart} aria-label="Carrito de compras">
            <i className="fas fa-shopping-cart"></i>
            {/* Opcional: <span className={styles.cartCount}>0</span> */}
          </button>

          <div className={styles.profileSection}>
            <button className={styles.navIcon} onClick={toggleProfileMenu} aria-label="Menú de usuario">
              <i className="fas fa-user-circle"></i>
              <span className={styles.profileName}>{user?.nombre || user?.username}</span>
            </button>
            {isProfileMenuOpen && (
              <div className={styles.profileDropdown}>
                <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mi Perfil</Link>
                {user?.role === 'cliente' && <Link to="/my-orders" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mis Pedidos</Link>}
                {user?.role === 'empleado' && <Link to="/dashboard-empleado" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Panel Empleado</Link>}
                {user?.role === 'admin' && <Link to="/dashboard-admin" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Panel Admin</Link>}
                <button onClick={handleLogout} className={styles.dropdownItemLogout}>Cerrar Sesión</button>
              </div>
            )}
          </div>
          {/* Botón de Hamburguesa para móvil (siempre visible para AuthHeader) */}
          <button
            className={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Segundo nivel de navegación (debajo del header principal) */}
      <SecondaryNav />


      {/* Menú móvil desplegable para usuarios autenticados */}
      {isMobileMenuOpen && (
         <nav className={styles.mobileMenuOpen}>
            <ul className={styles.navList}>
                <li className={styles.navItem}><Link to="/home" className={styles.navLink} onClick={toggleMobileMenu}>Inicio</Link></li>
                {user?.role === 'cliente' && <li className={styles.navItem}><Link to="/my-orders" className={styles.navLink} onClick={toggleMobileMenu}>Mis Pedidos</Link></li>}
                {user?.role === 'empleado' && <li className={styles.navItem}><Link to="/dashboard-empleado" className={styles.navLink} onClick={toggleMobileMenu}>Panel Empleado</Link></li>}
                {user?.role === 'admin' && <li className={styles.navItem}><Link to="/dashboard-admin" className={styles.navLink} onClick={toggleMobileMenu}>Panel Admin</Link></li>}
                <li className={styles.navItem}>
                    <button onClick={handleLogout} className={styles.navLink}>Cerrar Sesión</button>
                </li>
            </ul>
        </nav>
      )}

      {/* Aside/Modal para el carrito de compras */}
      {isCartOpen && (
        <div className={styles.cartAside}>
          <button className={styles.closeCartButton} onClick={toggleCart}>X</button>
          <h3>Tu Carrito</h3>
          <p>Tu carrito está vacío.</p>
          <button className={styles.checkoutButton}>Finalizar Compra</button>
        </div>
      )}

      {/* Aside/Modal para el menú de cuadrícula */}
      {isGridMenuOpen && (
        <div className={styles.gridMenuAside}>
          <button className={styles.closeGridMenuButton} onClick={toggleGridMenu}>X</button>
          <h3>Categorías</h3>
          <ul className={styles.gridMenuNavList}>
            <li><Link to="/category/sofas" onClick={toggleGridMenu}>Sofás</Link></li>
            <li><Link to="/category/sillas" onClick={toggleGridMenu}>Sillas</Link></li>
            <li><Link to="/category/cabeceros" onClick={toggleGridMenu}>Cabeceros</Link></li>
            <li><Link to="/category/cojines" onClick={toggleGridMenu}>Cojines</Link></li>
            <li><Link to="/category/personalizados" onClick={toggleGridMenu}>Proyectos Personalizados</Link></li>
            {/* Agrega más categorías aquí */}
          </ul>
        </div>
      )}
    </header>
  );
};

export default AuthHeader;

