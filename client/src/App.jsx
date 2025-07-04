// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Importa los componentes de tus páginas
import LandingPageContent from './pages/LandingPage/LandingPageContent.jsx'; // Añadido .jsx
import Home from './pages/Home/Home.jsx'; // Añadido .jsx
import ServicePage from './pages/ServicePage/ServicePage.jsx'; // Añadido .jsx
// IMPORTA EL COMPONENTE DE LA PÁGINA DE CONTACTO
import ContactPage from './pages/contacto/contactPage.jsx'; // Añadido .jsx

// IMPORTA EL NUEVO COMPONENTE DE REGISTRO
import RegisterForm from './components/Auth/RegisterForm.jsx'; // Añadido .jsx <--- ¡Nueva importación!

// Importa ambos headers
import AuthHeader from './components/User/AuthHeader/AuthHeader.jsx'; // Añadido .jsx // Header para clientes
import AdminHeader from './components/Admin/AdminHeader/AdminHeader.jsx'; // Añadido .jsx // Header para admin/empleados

// Importa los componentes de gestión de cotizaciones
import CotizacionesGestionPage from './pages/Admin/Cotizaciones/CotizacionesGestionPage.jsx'; // Añadido .jsx
import CotizacionEditPage from './pages/Admin/Cotizaciones/CotizacionEditPage.jsx'; // Añadido .jsx

// IMPORTA EL NUEVO COMPONENTE DE GESTIÓN DE TRABAJOS
import TrabajoGestionPage from './pages/Admin/TrabajosGestionPage/TrabajosGestionPage.jsx'; // Añadido .jsx

// IMPORTA EL NUEVO COMPONENTE DE GESTIÓN DE MATERIALES
import MaterialesPage from './pages/Admin/Materiales/MaterialPage.jsx'; // Añadido .jsx

// IMPORTA EL COMPONENTE DE GESTIÓN DE EMPLEADOS
import EmpleadosPage from './pages/Admin/Empleados/EmpleadosPage.jsx'; // Añadido .jsx

// IMPORTA EL NUEVO COMPONENTE DE GESTIÓN DE CLIENTES
import ClientesPage from './pages/Admin/Clientes/ClientesPage.jsx'; // Añadido .jsx

// IMPORTA EL COMPONENTE DASHBOARD PRINCIPAL
import Dashboard from './pages/dashboard/Dashboard.jsx'; // Añadido .jsx

// IMPORTA EL NUEVO COMPONENTE PARA LAS COTIZACIONES DEL CLIENTE
import ClientCotizacionesPage from './pages/clientes/cotizaciones/ClientCotizacionesPage.jsx'; // Añadido .jsx


// Importa el selector de usuario desde tu slice de autenticación
import { selectUser, selectIsAuthenticated } from './features/auth/authSlice.js'; // Añadido .js (asumiendo que es un archivo .js)


// Componente para proteger rutas (ProtectedRoute)
// Envuelve los componentes que requieren autenticación y/o roles específicos.
const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated); // Obtiene el estado de autenticación del store
    const user = useSelector(selectUser); // Obtiene el objeto de usuario del store
    const navigate = useNavigate(); // Hook para la navegación

    // Efecto para manejar la lógica de redirección basada en la autenticación y los roles
    React.useEffect(() => {
        // Si no está autenticado, redirige a la página de inicio (LandingPage)
        if (!isAuthenticated) {
            navigate('/', { replace: true });
        }
        // Si está autenticado pero no tiene un rol permitido para la ruta actual
        else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            navigate('/acceso-denegado', { replace: true }); // Redirige a una página de acceso denegado
            console.error('No tienes permisos para acceder a esta página.');
        }
    }, [isAuthenticated, user, navigate, allowedRoles]); // Dependencias del efecto

    // Si el usuario no está autenticado o no tiene los roles permitidos, no renderiza los children
    if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
        return null; // No renderiza nada mientras se produce la redirección
    }

    // Si el usuario está autenticado y tiene los roles permitidos, renderiza los children
    return children;
};

// Componente principal de la aplicación
function App() {
    const user = useSelector(selectUser); // Obtiene el objeto de usuario del estado de Redux
    const isAuthenticated = useSelector(selectIsAuthenticated); // Obtiene el estado de autenticación

    // Lógica para determinar qué encabezado (Header) se debe renderizar
    // Esto permite cambiar el Header globalmente basado en el rol del usuario
    let CurrentHeaderComponent = null;
    if (isAuthenticated) {
        // Si el usuario es un 'cliente', usa el AuthHeader normal
        if (user?.role === 'cliente') {
            CurrentHeaderComponent = AuthHeader;
        }
        // Si el usuario es un 'empleado', 'admin' o 'gerente', usa el AdminHeader
        else if (user?.role === 'empleado' || user?.role === 'admin' || user?.role === 'gerente') {
            CurrentHeaderComponent = AdminHeader;
        }
    }

    return (
        <Router>
            {/* El encabezado se renderiza aquí, antes de todas las rutas.
                Se renderizará condicionalmente basado en el rol del usuario. */}
            {CurrentHeaderComponent && <CurrentHeaderComponent />}

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
                    path="/contacto" // Puedes elegir la ruta que prefieras, por ejemplo, /contacto
                    element={<ContactPage />} // La página de contacto no necesita ser protegida por roles
                />

                {/* NUEVA RUTA PARA EL REGISTRO DE CLIENTES */}
                <Route
                    path="/register" // Ruta para el formulario de registro
                    element={<RegisterForm />} // El componente de registro
                />

                {/* NUEVA RUTA PARA LAS COTIZACIONES DEL CLIENTE */}
                <Route
                    path="/my-cotizaciones" // La ruta que el cliente usará para ver sus cotizaciones
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
                            {/* ¡Aquí se renderiza el componente Dashboard! */}
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
                        <ProtectedRoute allowedRoles={['admin', 'gerente']}> {/* Solo admin y gerente pueden ver y gestionar empleados */}
                            <EmpleadosPage />
                        </ProtectedRoute>
                    }
                />

                {/* GESTIÓN DE CLIENTES - NUEVA RUTA */}
                <Route
                    path="/admin/clientes"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'gerente']}> {/* Solo admin y gerente pueden ver y gestionar clientes */}
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
                <Route path="*" element={<LandingPageContent />} /> {/* Redirige a LandingPage si la ruta no existe */}
            </Routes>
        </Router>
    );
}

export default App;
