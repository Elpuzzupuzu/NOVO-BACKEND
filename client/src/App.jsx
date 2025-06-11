// client/src/App.jsx (¡Este es el archivo principal del Router!)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Importa los componentes de tus páginas
import LandingPageContent from './pages/LandingPage/LandingPageContent';
import Home from './pages/Home/Home';
import ServicePage from './pages/ServicePage/ServicePage';

// Importa ambos headers
import AuthHeader from './components/User/AuthHeader/AuthHeader'; // Header para clientes
import AdminHeader from './components/Admin/AdminHeader/AdminHeader'; // Header para admin/empleados

// Importa los componentes de gestión de cotizaciones
import CotizacionesGestionPage from './pages/Admin/Cotizaciones/CotizacionesGestionPage';
import CotizacionEditPage from './pages/Admin/Cotizaciones/CotizacionEditPage';

// Importa el selector de usuario desde tu slice de autenticación
import { selectUser, selectIsAuthenticated } from './features/auth/authSlice';


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
      // En un entorno de producción, evita usar 'alert()' para mensajes al usuario.
      // En su lugar, usa un sistema de notificación (toast, modal personalizado, etc.).
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
    // Puedes añadir más condiciones 'else if' para otros roles si es necesario
  }
  // Si no está autenticado, CurrentHeaderComponent será 'null', lo que significa
  // que las páginas no protegidas (como LandingPageContent) se encargarán de su propio diseño
  // o no tendrán un encabezado específico.

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
              <Home /> {/* El componente Home no debe renderizar el Header internamente */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/servicios"
          element={
            <ProtectedRoute allowedRoles={['admin', 'empleado', 'cliente']}>
              <ServicePage /> {/* El componente ServicePage no debe renderizar el Header internamente */}
            </ProtectedRoute>
          }
        />

        {/* Rutas para el panel de administración / empleados */}
        {/* Dashboard principal de administración */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
              {/* Contenido placeholder para el Dashboard de Administración */}
              <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
                <h2>Dashboard de Administración</h2>
                <p>Bienvenido, {user?.nombre || user?.username}. Tu rol es: {user?.role}.</p>
                {/* Aquí se reemplazará por el componente AdminDashboardPage */}
              </div>
            </ProtectedRoute>
          }
        />
        
        {/* Gestión de Cotizaciones: Ruta para la página de listado y búsqueda */}
        <Route
          path="/admin/cotizaciones"
          element={
            <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
              <CotizacionesGestionPage /> {/* ¡Aquí se renderiza el componente real de gestión! */}
            </ProtectedRoute>
          }
        />

        {/* Edición de Cotización: Ruta para la página de edición de una cotización específica */}
        <Route
          path="/admin/cotizaciones/edit/:id_cotizacion"
          element={
            <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
              <CotizacionEditPage /> {/* ¡Aquí se renderiza el componente real de edición! */}
            </ProtectedRoute>
          }
        />

        {/* Gestión de Materiales */}
         <Route
          path="/admin/materiales"
          element={
            <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
              {/* Contenido placeholder para la Gestión de Materiales */}
              <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
                <h2>Gestión de Materiales</h2>
                <p>Administración del inventario de materiales.</p>
              </div>
            </ProtectedRoute>
          }
        />
        {/* Gestión de Usuarios (solo para administradores) */}
         <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              {/* Contenido placeholder para la Gestión de Usuarios */}
              <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
                <h2>Gestión de Usuarios</h2>
                <p>Administración de usuarios y roles.</p>
              </div>
            </ProtectedRoute>
          }
        />
        {/* Gestión de Proyectos */}
         <Route
          path="/admin/proyectos"
          element={
            <ProtectedRoute allowedRoles={['admin', 'empleado', 'gerente']}>
              {/* Contenido placeholder para la Gestión de Proyectos */}
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
              {/* Contenido placeholder para Reportes y Estadísticas */}
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
      </Routes>
    </Router>
  );
}

export default App;
