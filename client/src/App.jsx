// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Importa los componentes de tus páginas
import LandingPageContent from './pages/LandingPage/LandingPageContent.jsx';
import Home from './pages/Home/Home.jsx';
import ServicePage from './pages/ServicePage/ServicePage.jsx';
import ContactPage from './pages/contacto/contactPage.jsx';

// IMPORTA EL NUEVO COMPONENTE DE REGISTRO
import RegisterForm from './components/Auth/RegisterForm.jsx';

// Importa ambos headers
import AuthHeader from './components/User/AuthHeader/AuthHeader.jsx'; // Header para clientes
import AdminHeader from './components/Admin/AdminHeader/AdminHeader.jsx'; // Header para admin/empleados

// Importa los componentes de gestión de cotizaciones
import CotizacionesGestionPage from './pages/Admin/Cotizaciones/CotizacionesGestionPage.jsx';
import CotizacionEditPage from './pages/Admin/Cotizaciones/CotizacionEditPage.jsx';

// IMPORTA EL NUEVO COMPONENTE DE GESTIÓN DE TRABAJOS
import TrabajoGestionPage from './pages/Admin/TrabajosGestionPage/TrabajosGestionPage.jsx';

// IMPORTA EL NUEVO COMPONENTE DE GESTIÓN DE MATERIALES
import MaterialesPage from './pages/Admin/Materiales/MaterialPage.jsx';

// IMPORTA EL COMPONENTE DE GESTIÓN DE EMPLEADOS
import EmpleadosPage from './pages/Admin/Empleados/EmpleadosPage.jsx';

// IMPORTA EL NUEVO COMPONENTE DE GESTIÓN DE CLIENTES
import ClientesPage from './pages/Admin/Clientes/ClientesPage.jsx';

// IMPORTA EL COMPONENTE DASHBOARD PRINCIPAL
import Dashboard from './pages/dashboard/Dashboard.jsx';

// IMPORTA EL NUEVO COMPONENTE PARA LAS COTIZACIONES DEL CLIENTE
import ClientCotizacionesPage from './pages/clientes/cotizaciones/ClientCotizacionesPage.jsx';


// Importa el selector de usuario desde tu slice de autenticación
import { selectUser, selectIsAuthenticated } from './features/auth/authSlice.js';


// Componente para proteger rutas (ProtectedRoute)
// Envuelve los componentes que requieren autenticación y/o roles específicos.
const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            navigate('/acceso-denegado', { replace: true });
            console.error('No tienes permisos para acceder a esta página.');
        }
    }, [isAuthenticated, user, navigate, allowedRoles]);

    if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
        return null;
    }

    return children;
};

// Componente principal de la aplicación
function App() {
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    let CurrentHeaderComponent = null;
    // Definimos una 'key' única para cada tipo de Header
    // Esto fuerza a React a desmontar el componente anterior y montar uno nuevo
    // cuando el tipo de Header cambia, evitando artefactos visuales.
    let headerKey = 'default-unauthenticated-header'; 

    if (isAuthenticated) {
        if (user?.role === 'cliente') {
            CurrentHeaderComponent = AuthHeader;
            headerKey = 'authenticated-client-header'; // Key específica para cliente autenticado
        } else if (user?.role === 'empleado' || user?.role === 'admin' || user?.role === 'gerente') {
            CurrentHeaderComponent = AdminHeader;
            headerKey = 'authenticated-admin-header'; // Key específica para admin/empleado/gerente
        }
    } else {
        // Si no está autenticado, siempre muestra el AuthHeader
        CurrentHeaderComponent = AuthHeader;
        // Si el usuario no está autenticado, pero AuthHeader es el componente por defecto,
        // la key sigue siendo 'default-unauthenticated-header'.
        // Si antes era cliente autenticado y se desloguea, la key cambia y se desmonta.
    }

    return (
        <Router>
            {/* Renderiza el encabezado con la 'key' dinámica */}
            {CurrentHeaderComponent && <CurrentHeaderComponent key={headerKey} />}

            <Routes>
                {/* Ruta raíz: Página de aterrizaje para usuarios no autenticados */}
                <Route path="/" element={<LandingPageContent />} />

                {/* Rutas protegidas que usarán el encabezado condicional */}
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'cliente']}>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/servicios"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'cliente']}>
                            <ServicePage />
                        </ProtectedRoute>
                    }
                />

                {/* NUEVA RUTA PARA LA PÁGINA DE CONTACTO */}
                <Route
                    path="/contacto"
                    element={<ContactPage />}
                />

                {/* NUEVA RUTA PARA EL REGISTRO DE CLIENTES */}
                <Route
                    path="/register"
                    element={<RegisterForm />}
                />

                {/* NUEVA RUTA PARA LAS COTIZACIONES DEL CLIENTE */}
                <Route
                    path="/my-cotizaciones"
                    element={
                        <ProtectedRoute allowedRoles={['cliente']}>
                            <ClientCotizacionesPage/>
                        </ProtectedRoute>
                    }
                />

                {/* Rutas para el panel de administración / empleados */}
                {/* Dashboard principal de administración */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
                            <Dashboard/>
                        </ProtectedRoute>
                    }
                />

                {/* Gestión de Cotizaciones: Ruta para la página de listado y búsqueda */}
                <Route
                    path="/admin/cotizaciones"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
                            <CotizacionesGestionPage />
                        </ProtectedRoute>
                    }
                />

                {/* Edición de Cotización: Ruta para la página de edición de una cotización específica */}
                <Route
                    path="/admin/cotizaciones/edit/:id_cotizacion"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
                            <CotizacionEditPage />
                        </ProtectedRoute>
                    }
                />

                {/* GESTIÓN DE TRABAJOS: RUTA PARA LA PÁGINA DE LISTADO Y BÚSQUEDA */}
                <Route
                    path="/admin/trabajos"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
                            <TrabajoGestionPage />
                        </ProtectedRoute>
                    }
                />

                {/* Gestión de Materiales */}
                <Route
                    path="/admin/materiales"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
                            <MaterialesPage/>
                        </ProtectedRoute>
                    }
                />

                {/* GESTIÓN DE EMPLEADOS */}
                <Route
                    path="/admin/empleados"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                            <EmpleadosPage />
                        </ProtectedRoute>
                    }
                />

                {/* GESTIÓN DE CLIENTES - NUEVA RUTA */}
                <Route
                    path="/admin/clientes"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                            <ClientesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Gestión de Proyectos */}
                <Route
                    path="/admin/proyectos"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
                            <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
                                <h2>Gestión de Proyectos</h2>
                                <p>Seguimiento de proyectos y trabajos en curso.</p>
                            </div>
                        </ProtectedRoute>
                    }
                />
                {/* Reportes y Estadísticas (para administradores y gerentes) */}
                <Route
                    path="/admin/reportes"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                            <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
                                <h2>Reportes y Estadísticas</h2>
                                <p>Visualización de datos y generación de reportes.</p>
                            </div>
                        </ProtectedRoute>
                    }
                />

                {/* Ruta para "Acceso Denegado" */}
                <Route path="/acceso-denegado" element={
                        <div style={{ textAlign: 'center', paddingTop: '50px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#f0f0f0' }}>
                            <h2>Acceso Denegado</h2>
                            <p>No tienes permisos para ver esta página.</p>
                            <button
                                style={{
                                    backgroundColor: '#ff9900', color: '#fff', border: 'none', padding: '10px 20px',
                                    borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', marginTop: '20px'
                                }}
                                onClick={() => window.location.href = '/'}
                            >
                                Volver a la página principal
                            </button>
                        </div>
                } />
                {/* Ruta por defecto o "catch-all" */}
                <Route path="*" element={<LandingPageContent />} />
            </Routes>
        </Router>
    );
}

export default App;