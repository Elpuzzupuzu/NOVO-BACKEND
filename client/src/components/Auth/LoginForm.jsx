import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginEmployee, loginClient, clearError } from '../../features/auth/authSlice';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEmployeeLogin, setIsEmployeeLogin] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, isEmployeeLogin]);

  // Efecto para redirigir si el login es exitoso
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`¡Login exitoso! Bienvenido, ${user.nombre || user.username}. Rol: ${user.role}`);
      // Redirige al usuario a la página de inicio protegida
      navigate('/home');
      // Opcionalmente, resetear el formulario después de un login exitoso si no hay redirección
      setUsername('');
      setPassword('');
    }
  }, [isAuthenticated, user, navigate]);

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

  const handleRegisterRedirect = () => {
    // Redirige al usuario a la página de registro de clientes
    navigate('/register');
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

      {/* Nueva sección para registrarse */}
      {!isEmployeeLogin && ( // Solo muestra la opción de registrarse si no es un login de empleado
        <div className={styles.registerSection}>
          <p>¿No tienes una cuenta?</p>
          <button
            type="button"
            className={styles.registerButton}
            onClick={handleRegisterRedirect}
          >
            Registrarse como Cliente
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;