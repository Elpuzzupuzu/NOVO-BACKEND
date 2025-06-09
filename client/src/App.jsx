// client/src/App.jsx (¡Este es el nuevo archivo principal del Router!)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Importa los componentes de tus páginas
import LandingPageContent from './pages/LandingPage/LandingPageContent'; // <--- ¡Tu antigua App.jsx renombrada!
import Home from './pages/Home/Home'; // Tu Home para usuarios logeados

// No necesitas Header/Footer aquí si ya están dentro de LandingPageContent
// import Header from './components/Header/Header';
// import Footer from './components/Footer/Footer';

// No necesitas styles aquí si los estilos generales están en index.css o global.css
// import styles from './App.module.css'; // Eliminar o renombrar si solo son estilos de layout

// Componente para proteger rutas (mantén el mismo de antes)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      // Si no está autenticado, redirige a la Landing Page
      navigate('/', { replace: true });
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Si está autenticado pero no tiene el rol permitido
      navigate('/acceso-denegado', { replace: true });
      alert('No tienes permisos para acceder a esta página.');
    }
  }, [isAuthenticated, user, navigate, allowedRoles]);

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null; // No renderiza nada mientras redirige
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz: Muestra la Landing Page para usuarios no autenticados */}
        <Route path="/" element={<LandingPageContent />} />

        {/* Ruta protegida para el Home después del login */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['admin', 'empleado', 'cliente']}> {/* Ajusta los roles permitidos */}
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Ruta para acceso denegado (opcional) */}
        <Route path="/acceso-denegado" element={
            <div style={{ textAlign: 'center', paddingTop: '50px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#f0f0f0' }}>
                {/* Puedes añadir un Header o Footer si quieres, pero aquí se muestra simple */}
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

        {/* Puedes añadir más rutas protegidas o públicas aquí */}
      </Routes>
    </Router>
  );
}

export default App;