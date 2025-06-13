// client/src/components/Admin/AdminHeader/AdminHeader.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout, selectUser } from '../../../features/auth/authSlice'; // Importa selectUser
import styles from './AdminHeader.module.css'; // Crearemos un CSS específico para este header
// Importa íconos de Font Awesome si los estás usando
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch, faUserCircle, faShoppingCart, faThLarge, faBars } from '@fortawesome/free-solid-svg-icons';


const AdminHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // Para el AdminHeader, el carrito y el menú de cuadrícula de categorías generales
    // no son tan relevantes, podríamos simplificarlos o eliminarlos.
    // Mantendré la estructura para que decidas si los necesitas.
    const [isCartOpen, setIsCartOpen] = useState(false); // Mantener por si acaso, aunque menos relevante para admin
    const [isGridMenuOpen, setIsGridMenuOpen] = useState(false); // Mantener por si acaso

    const user = useSelector(selectUser); // Obtiene el usuario del estado de Redux
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
        setIsGridMenuOpen(false);
    };

    const toggleCart = () => { // Mantener por si acaso, pero menos relevante
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

    const toggleGridMenu = () => { // Mantener por si acaso, pero menos relevante
        setIsGridMenuOpen(!isGridMenuOpen);
        setIsProfileMenuOpen(false);
        setIsCartOpen(false);
        setIsMobileMenuOpen(false);
    };

    // Manejador para cerrar sesión
    const handleLogout = () => {
        dispatch(logout());
        setIsProfileMenuOpen(false);
        navigate('/'); // Redirige a la landing page después de cerrar sesión
    };

    // Componente del segundo nivel de navegación para ADMINISTRACIÓN
    const SecondaryNav = () => (
        <nav className={styles.secondaryNav}>
            <ul className={styles.secondaryNavList}>
                {/* Dashboard principal de administración */}
                <li><Link to="/admin/dashboard" className={styles.secondaryNavLink}>DASHBOARD</Link></li>
                
                {/* Gestión de Cotizaciones (todos los empleados/admin) */}
                <li><Link to="/admin/cotizaciones" className={styles.secondaryNavLink}>COTIZACIONES</Link></li>

                {/* Gestión de Pedidos/Proyectos */}
                <li><Link to="/admin/trabajos" className={styles.secondaryNavLink}>PROYECTOS</Link></li>

                {/* Gestión de Materiales (empleados/admin) */}
                {(user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin') && (
                    <li><Link to="/admin/materiales" className={styles.secondaryNavLink}>MATERIALES</Link></li>
                )}

                {/* Gestión de Usuarios (solo admin) */}
                {user?.role === 'admin' && (
                    <li><Link to="/admin/usuarios" className={styles.secondaryNavLink}>USUARIOS</Link></li>
                )}
                
                {/* Reportes y Estadísticas (gerente/admin) */}
                {(user?.role === 'gerente' || user?.role === 'admin') && (
                    <li><Link to="/admin/reportes" className={styles.secondaryNavLink}>REPORTES</Link></li>
                )}

                {/* Puedes añadir más enlaces aquí según las necesidades de gestión */}
                {/* Por ejemplo, Gestión de Proveedores, Facturación, etc. */}
            </ul>
        </nav>
    );

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            {/* Sección Superior del Header */}
            <div className={styles.headerTop}>
                <div className={styles.logoContainer}>
                    {/* El logo en el AdminHeader debería ir al dashboard de admin */}
                    <Link to="/admin/dashboard" className={styles.logoLink}>
                        <img
                            src="/novologo.jpg" // Asegúrate de que esta ruta sea accesible
                            alt="NOVO Tapicería Logo"
                            className={styles.logoImage}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className={styles.logoText}>
                            <span className={styles.mainLogo}>NOVO</span>
                            <span className={styles.subLogo}>ADMIN</span> {/* O "Empleado" según el rol */}
                        </div>
                    </Link>
                </div>

                {/* Contenedor central para búsqueda */}
                <div className={styles.centerSection}>
                    {/* La búsqueda aquí podría ser específica para la administración (ej. buscar cotización por ID) */}
                    <div className={styles.searchBar}>
                        <input type="text" placeholder="Buscar en administración..." className={styles.searchInput} />
                        <button className={styles.searchButton} aria-label="Buscar">
                            {/* <FontAwesomeIcon icon={faSearch} /> */} <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>

                {/* Iconos de usuario */}
                <div className={styles.userIcons}>
                    {/* El carrito de compras no es relevante aquí, podríamos eliminarlo o darle otro uso */}
                    {/* <button className={styles.navIcon} onClick={toggleCart} aria-label="Carrito de compras">
                        <FontAwesomeIcon icon={faShoppingCart} />
                    </button> */}

                    <div className={styles.profileSection}>
                        <button className={styles.navIcon} onClick={toggleProfileMenu} aria-label="Menú de usuario">
                            {/* <FontAwesomeIcon icon={faUserCircle} /> */} <i className="fas fa-user-circle"></i>
                            <span className={styles.profileName}>{user?.nombre || user?.username || 'Admin'}</span>
                        </button>
                        {isProfileMenuOpen && (
                            <div className={styles.profileDropdown}>
                                <Link to="/admin/profile" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mi Perfil</Link>
                                {/* Opciones específicas de administración/empleado */}
                                {user?.role === 'empleado' && <Link to="/admin/dashboard-empleado" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mi Dashboard</Link>}
                                {user?.role === 'admin' && <Link to="/admin/dashboard" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Panel de Admin</Link>}
                                {/* Puedes añadir más enlaces aquí, ej. "Configuración" */}
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
                        {/* <FontAwesomeIcon icon={faBars} /> */} <span></span><span></span><span></span>
                    </button>
                </div>
            </div>

            {/* Segundo nivel de navegación */}
            <SecondaryNav />

            {/* Menú móvil desplegable para usuarios autenticados */}
            {isMobileMenuOpen && (
                <nav className={styles.mobileMenuOpen}>
                    <ul className={styles.navList}>
                        <li className={styles.navItem}><Link to="/admin/dashboard" className={styles.navLink} onClick={toggleMobileMenu}>Dashboard</Link></li>
                        <li className={styles.navItem}><Link to="/admin/cotizaciones" className={styles.navLink} onClick={toggleMobileMenu}>Cotizaciones</Link></li>
                        <li className={styles.navItem}><Link to="/admin/proyectos" className={styles.navLink} onClick={toggleMobileMenu}>Proyectos</Link></li>
                        {(user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin') && (
                            <li className={styles.navItem}><Link to="/admin/materiales" className={styles.navLink} onClick={toggleMobileMenu}>Materiales</Link></li>
                        )}
                        {user?.role === 'admin' && (
                            <li className={styles.navItem}><Link to="/admin/usuarios" className={styles.navLink} onClick={toggleMobileMenu}>Usuarios</Link></li>
                        )}
                        {(user?.role === 'gerente' || user?.role === 'admin') && (
                            <li className={styles.navItem}><Link to="/admin/reportes" className={styles.navLink} onClick={toggleMobileMenu}>Reportes</Link></li>
                        )}
                        <li className={styles.navItem}><Link to="/admin/profile" className={styles.navLink} onClick={toggleMobileMenu}>Mi Perfil</Link></li>
                        <li className={styles.navItem}>
                            <button onClick={handleLogout} className={styles.navLink}>Cerrar Sesión</button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Asides/Modals (si los mantienes, ajusta su contenido para administración) */}
            {isCartOpen && ( // Menos relevante, puedes eliminarlo
                <div className={styles.cartAside}>
                    <button className={styles.closeCartButton} onClick={toggleCart}>X</button>
                    <h3>Funciones de Admin/Empleado (ej. Resumen de Tareas)</h3>
                    <p>Aquí podría ir un resumen de tareas o notificaciones.</p>
                </div>
            )}
            {isGridMenuOpen && ( // Menos relevante, puedes eliminarlo
                <div className={styles.gridMenuAside}>
                    <button className={styles.closeGridMenuButton} onClick={toggleGridMenu}>X</button>
                    <h3>Herramientas Rápidas</h3>
                    <ul className={styles.gridMenuNavList}>
                        <li><Link to="/admin/cotizaciones/crear" onClick={toggleGridMenu}>Nueva Cotización</Link></li>
                        <li><Link to="/admin/materiales/crear" onClick={toggleGridMenu}>Nuevo Material</Link></li>
                        {/* Agrega más herramientas */}
                    </ul>
                </div>
            )}
        </header>
    );
};

export default AdminHeader;
