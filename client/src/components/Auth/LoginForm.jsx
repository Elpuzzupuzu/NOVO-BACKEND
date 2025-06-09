// client/src/components/Auth/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // <--- ¡Importa useNavigate!
import { loginEmployee, loginClient, clearError } from '../../features/auth/authSlice';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEmployeeLogin, setIsEmployeeLogin] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate(); // <--- ¡Inicializa useNavigate!
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, isEmployeeLogin]);

  // Efecto para redirigir si el login es exitoso
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`¡Login exitoso! Bienvenido, ${user.nombre || user.username}. Rol: ${user.role}`);
      // Redirige al usuario a la página de inicio protegida
      navigate('/home'); // <--- ¡Redirección aquí!
      // Opcionalmente, resetear el formulario después de un login exitoso si no hay redirección
      setUsername('');
      setPassword('');
    }
  }, [isAuthenticated, user, navigate]); // Añade 'navigate' a las dependencias

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const credentials = { username, password };
    if (isEmployeeLogin) {
      dispatch(loginEmployee(credentials));
    } else {
      dispatch(loginClient(credentials));
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>INICIAR SESIÓN</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <input
          type="text"
          name="username"
          placeholder="Nombre de Usuario"
          className={styles.inputField}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          aria-label="Nombre de usuario"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Contraseña"
        />

        <div className={styles.loginTypeToggle}>
          <label>
            <input
              type="checkbox"
              checked={isEmployeeLogin}
              onChange={() => setIsEmployeeLogin(!isEmployeeLogin)}
            />
            Soy Empleado
          </label>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'ENTRAR'}
        </button>
      </form>
      {/* Ya no necesitamos este mensaje de loggedInMessage aquí porque el usuario será redirigido */}
      {/* {isAuthenticated && (
        <div className={styles.loggedInMessage}>
          <p>¡Has iniciado sesión como {user?.username} ({user?.role})!</p>
        </div>
      )} */}
    </div>
  );
};

export default LoginForm;