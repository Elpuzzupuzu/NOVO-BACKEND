import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../../features/auth/authSlice';
import styles from './AuthHeader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCircle, faShoppingCart, faThLarge, faBars } from '@fortawesome/free-solid-svg-icons';

const AuthHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);

    // Referencia para la sección de perfil (botón + dropdown)
    const profileSectionRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // LÓGICA: Efecto para cambiar el estilo del header al hacer scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // LÓGICA: Cerrar el dropdown del perfil si se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            // Si el menú de perfil está abierto y el clic no fue dentro de la sección de perfil
            if (profileSectionRef.current && !profileSectionRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        }
        // Añadir el event listener al documento
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Limpiar el event listener al desmontar el componente
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileMenuOpen]); // Dependencia: re-ejecutar si el estado del menú cambia

    // LÓGICA: Cerrar el dropdown cuando el mouse sale de la sección de perfil (con un pequeño retraso)
    const handleProfileSectionMouseLeave = () => {
        if (isProfileMenuOpen) {
            // Guardar el ID del timeout en la referencia para poder cancelarlo
            if (profileSectionRef.current) {
                profileSectionRef.current.timeoutId = setTimeout(() => {
                    setIsProfileMenuOpen(false);
                }, 200); // Retraso de 200ms para suavizar la experiencia
            }
        }
    };

    // LÓGICA: Cancelar el cierre si el mouse re-entra a la sección de perfil
    const handleProfileSectionMouseEnter = () => {
        if (profileSectionRef.current && profileSectionRef.current.timeoutId) {
            clearTimeout(profileSectionRef.current.timeoutId);
            // Opcional: Eliminar la propiedad timeoutId después de limpiarla
            delete profileSectionRef.current.timeoutId;
        }
    };

    // Funciones para alternar la visibilidad de menús/asides, cerrando los otros
    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        setIsCartOpen(false);
        setIsMobileMenuOpen(false);
        setIsGridMenuOpen(false);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsGridMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsProfileMenuOpen(false);
        setIsCartOpen(false);
        setIsGridMenuOpen(false);
    };

    const toggleGridMenu = () => {
        setIsGridMenuOpen(!isGridMenuOpen);
        setIsProfileMenuOpen(false);
        setIsCartOpen(false);
        setIsMobileMenuOpen(false);
    };

    // Manejador para cerrar sesión
    const handleLogout = () => {
        dispatch(logout());
        setIsProfileMenuOpen(false);
        navigate('/');
    };

    // Componente del segundo nivel de navegación (los enlaces de "INICIO", "CONTACTO" etc.)
    const SecondaryNav = () => (
        <nav className={styles.secondaryNav}>
            <ul className={styles.secondaryNavList}>
                <li><Link to="/home" className={styles.secondaryNavLink}>INICIO</Link></li>
                <li><Link to="/my-cotizaciones" className={styles.secondaryNavLink}>MIS COTIZACIONES</Link></li>
                <li><Link to="/servicios" className={styles.secondaryNavLink}>SOLICITAR SERVICIOS</Link></li>
                <li><Link to="/contacto" className={styles.secondaryNavLink}>CONTACTO</Link></li>
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
                        <FontAwesomeIcon icon={faThLarge} />
                    </button>
                    <div className={styles.searchBar}>
                        <input type="text" placeholder="Buscar productos, servicios..." className={styles.searchInput} />
                        <button className={styles.searchButton} aria-label="Buscar">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                </div>

                {/* Iconos de usuario y carrito */}
                <div
                    className={styles.userIcons}
                    ref={profileSectionRef} // Asigna la referencia aquí
                    onMouseEnter={handleProfileSectionMouseEnter} // Maneja el mouse enter para cancelar el timeout
                    onMouseLeave={handleProfileSectionMouseLeave} // Maneja el mouse leave aquí
                >
                    <button className={styles.navIcon} onClick={toggleCart} aria-label="Carrito de compras">
                        <FontAwesomeIcon icon={faShoppingCart} />
                        {/* Opcional: <span className={styles.cartCount}>0</span> */}
                    </button>

                    <div className={styles.profileSection}>
                        <button className={styles.navIcon} onClick={toggleProfileMenu} aria-label="Menú de usuario">
                            {/* Renderizar la imagen de perfil del usuario o un icono predeterminado */}
                            {user?.foto_perfil_url ? (
                                <img
                                    src={user.foto_perfil_url}
                                    alt="Foto de perfil"
                                    className={styles.profileImage}
                                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                />
                            ) : (
                                <FontAwesomeIcon icon={faUserCircle} />
                            )}
                            <span className={styles.profileName}>{user?.nombre || user?.username || 'Usuario'}</span>
                        </button>
                        {isProfileMenuOpen && (
                            <div className={styles.profileDropdown}>
                                <div className={styles.dropdownHeader}>
                                    {user?.foto_perfil_url ? (
                                        <img
                                            src={user.foto_perfil_url}
                                            alt="Foto de perfil"
                                            className={styles.dropdownProfileImage}
                                            onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                        />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserCircle} className={styles.dropdownProfileIcon} />
                                    )}
                                    <span className={styles.dropdownUserName}>{user?.nombre || user?.username || 'Usuario'}</span>
                                    {user?.role && <span className={styles.dropdownUserRole}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>}
                                </div>
                                <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mi Perfil</Link>
                                {user?.role === 'cliente' && <Link to="/my-orders" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mis Pedidos</Link>}
                                {user?.role === 'empleado' && <Link to="/admin/dashboard-empleado" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Panel Empleado</Link>}
                                {user?.role === 'admin' && <Link to="/admin/dashboard" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Panel Admin</Link>}
                                <button onClick={handleLogout} className={styles.dropdownItemLogout}>Cerrar Sesión</button>
                            </div>
                        )}
                    </div>
                    {/* Botón de Hamburguesa para móvil */}
                    <button
                        className={styles.hamburger}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        <FontAwesomeIcon icon={faBars} />
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
                        {user?.role === 'empleado' && <li className={styles.navItem}><Link to="/admin/dashboard-empleado" className={styles.navLink} onClick={toggleMobileMenu}>Panel Empleado</Link></li>}
                        {user?.role === 'admin' && <li className={styles.navItem}><Link to="/admin/dashboard" className={styles.navLink} onClick={toggleMobileMenu}>Panel Admin</Link></li>}
                        <li className={styles.navItem}><Link to="/profile" className={styles.navLink} onClick={toggleMobileMenu}>Mi Perfil</Link></li>
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
                    </ul>
                </div>
            )}
        </header>
    );
};

export default AuthHeader;