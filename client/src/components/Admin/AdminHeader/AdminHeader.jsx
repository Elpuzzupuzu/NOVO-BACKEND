import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout, selectUser } from '../../../features/auth/authSlice';
import styles from './AdminHeader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCircle, faShoppingCart, faThLarge, faBars } from '@fortawesome/free-solid-svg-icons';


const AdminHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Referencia para la sección de perfil (botón + dropdown)
    const profileSectionRef = useRef(null);

    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // LÓGICA: Cerrar el dropdown si se hace clic fuera de él
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
            // Asegurarse de que `profileSectionRef.current` exista antes de asignar `timeoutId`
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

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        // Asegúrate de cerrar otros menús si los hay
        // setIsCartOpen(false);
        // setIsMobileMenuOpen(false);
        // setIsGridMenuOpen(false);
    };

    // Puedes mantener o eliminar estas funciones si no usas el carrito/grid en admin
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);

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


    const handleLogout = () => {
        dispatch(logout());
        setIsProfileMenuOpen(false);
        navigate('/');
    };

    const SecondaryNav = () => (
        <nav className={styles.secondaryNav}>
            <ul className={styles.secondaryNavList}>
                <li><Link to="/admin/dashboard" className={styles.secondaryNavLink}>DASHBOARD</Link></li>
                <li><Link to="/admin/cotizaciones" className={styles.secondaryNavLink}>COTIZACIONES</Link></li>
                <li><Link to="/admin/trabajos" className={styles.secondaryNavLink}>PROYECTOS</Link></li>
                {(user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin') && (
                    <li><Link to="/admin/materiales" className={styles.secondaryNavLink}>MATERIALES</Link></li>
                )}
                {(user?.role === 'gerente' || user?.role === 'admin') && (
                    <li><Link to="/admin/empleados" className={styles.secondaryNavLink}>EMPLEADOS</Link></li>
                )}
                {(user?.role === 'gerente' || user?.role === 'admin') && (
                    <li><Link to="/admin/clientes" className={styles.secondaryNavLink}>CLIENTES</Link></li>
                )}
                {(user?.role === 'gerente' || user?.role === 'admin') && (
                    <li><Link to="/admin/reportes" className={styles.secondaryNavLink}>REPORTES</Link></li>
                )}
            </ul>
        </nav>
    );

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.headerTop}>
                <div className={styles.logoContainer}>
                    <Link to="/admin/dashboard" className={styles.logoLink}>
                        <img
                            src="/novologo.jpg"
                            alt="NOVO Tapicería Logo"
                            className={styles.logoImage}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className={styles.logoText}>
                            <span className={styles.mainLogo}>NOVO</span>
                            <span className={styles.subLogo}>ADMIN</span>
                        </div>
                    </Link>
                </div>

                <div className={styles.centerSection}>
                    <div className={styles.searchBar}>
                        <input type="text" placeholder="Buscar en administración..." className={styles.searchInput} />
                        <button className={styles.searchButton} aria-label="Buscar">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                </div>

                <div
                    className={styles.userIcons}
                    ref={profileSectionRef} // Asigna la referencia aquí
                    onMouseEnter={handleProfileSectionMouseEnter} // Maneja el mouse enter para cancelar el timeout
                    onMouseLeave={handleProfileSectionMouseLeave} // Maneja el mouse leave aquí
                >
                    {/* El div 'profileSection' se mantiene para encapsular el botón y el dropdown si es necesario para CSS o estructura */}
                    <div className={styles.profileSection}> 
                        <button className={styles.navIcon} onClick={toggleProfileMenu} aria-label="Menú de usuario">
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
                            <span className={styles.profileName}>{user?.nombre || user?.username || 'Admin'}</span>
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

                                <Link to="/admin/profile" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mi Perfil</Link>
                                {user?.role === 'empleado' && <Link to="/admin/dashboard-empleado" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Mi Dashboard</Link>}
                                {user?.role === 'admin' && <Link to="/admin/dashboard" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Panel de Admin</Link>}
                                <button onClick={handleLogout} className={styles.dropdownItemLogout}>Cerrar Sesión</button>
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.hamburger}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>
            </div>

            <SecondaryNav />

            {isMobileMenuOpen && (
                <nav className={styles.mobileMenuOpen}>
                    <ul className={styles.navList}>
                        <li className={styles.navItem}><Link to="/admin/dashboard" className={styles.navLink} onClick={toggleMobileMenu}>Dashboard</Link></li>
                        <li className={styles.navItem}><Link to="/admin/cotizaciones" className={styles.navLink} onClick={toggleMobileMenu}>Cotizaciones</Link></li>
                        <li className={styles.navItem}><Link to="/admin/proyectos" className={styles.navLink} onClick={toggleMobileMenu}>Proyectos</Link></li>
                        {(user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin') && (
                            <li className={styles.navItem}><Link to="/admin/materiales" className={styles.navLink} onClick={toggleMobileMenu}>Materiales</Link></li>
                        )}
                        {(user?.role === 'gerente' || user?.role === 'admin') && (
                            <li className={styles.navItem}><Link to="/admin/empleados" className={styles.navLink} onClick={toggleMobileMenu}>Empleados</Link></li>
                        )}
                        {(user?.role === 'gerente' || user?.role === 'admin') && (
                            <li className={styles.navItem}><Link to="/admin/clientes" className={styles.navLink} onClick={toggleMobileMenu}>Clientes</Link></li>
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

            {/* Asides/Modals (Mantener el mismo código para estos, no se vieron afectados por los cambios) */}
            {isCartOpen && (
                <div className={styles.cartAside}>
                    <button className={styles.closeCartButton} onClick={toggleCart}>X</button>
                    <h3>Funciones de Admin/Empleado (ej. Resumen de Tareas)</h3>
                    <p>Aquí podría ir un resumen de tareas o notificaciones.</p>
                </div>
            )}
            {isGridMenuOpen && (
                <div className={styles.gridMenuAside}>
                    <button className={styles.closeGridMenuButton} onClick={toggleGridMenu}>X</button>
                    <h3>Herramientas Rápidas</h3>
                    <ul className={styles.gridMenuNavList}>
                        <li><Link to="/admin/cotizaciones/crear" onClick={toggleGridMenu}>Nueva Cotización</Link></li>
                        <li><Link to="/admin/materiales/crear" onClick={toggleGridMenu}>Nuevo Material</Link></li>
                    </ul>
                </div>
            )}
        </header>
    );
};

export default AdminHeader;