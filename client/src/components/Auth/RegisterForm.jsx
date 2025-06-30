import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  registerClient,
  clearError,
  clearRegistrationStatus,
  selectAuthError,
  selectAuthStatus,
  selectRegistrationSuccess,
  selectRegistrationMessage,
} from '../../features/auth/authSlice';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '', // Mover al principio del estado para reflejar el orden visual
    apellido: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    contacto: '',
    direccion: '',
    // Si tu backend permite foto_perfil_url, también podrías añadirlo aquí
    // foto_perfil_url: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAuthStatus) === 'loading';
  const error = useSelector(selectAuthError);
  const registrationSuccess = useSelector(selectRegistrationSuccess);
  const registrationMessage = useSelector(selectRegistrationMessage);

  // Limpiar errores y estado de registro al montar el componente
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearRegistrationStatus());
  }, [dispatch]);

  // Redirigir a login si el registro es exitoso
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate('/', { state: { registrationSuccess: true, message: registrationMessage } });
        dispatch(clearRegistrationStatus());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, registrationMessage, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error || registrationSuccess || registrationMessage) {
      dispatch(clearError());
      dispatch(clearRegistrationStatus());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const { username, password, confirmPassword, email, nombre, contacto, direccion, apellido } = formData;

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const userData = { username, password, email, nombre, contacto, direccion, apellido };
    dispatch(registerClient(userData));
  };

  return (
    <div className={styles.registerContainer}>
      <h3 className={styles.formTitle}>REGISTRP</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Mensajes de estado y error */}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {registrationSuccess && registrationMessage && (
          <p className={styles.successMessage}>
            {registrationMessage}
          </p>
        )}
        {isLoading && registrationMessage && !error && !registrationSuccess && (
            <p className={styles.infoMessage}>
                {registrationMessage}
            </p>
        )}

        {/* 1. Nombre */}
        <input
          type="text"
          name="nombre"
          placeholder="Tu Nombre (requerido)"
          className={styles.inputField}
          value={formData.nombre}
          onChange={handleChange}
          required
          aria-label="Nombre"
        />
        {/* 2. Apellido */}
        <input
          type="text"
          name="apellido"
          placeholder="Tu Apellido (Opcional)"
          className={styles.inputField}
          value={formData.apellido}
          onChange={handleChange}
          aria-label="Apellido"
        />
        {/* 3. Nombre de Usuario */}
        <input
          type="text"
          name="username"
          placeholder="Nombre de Usuario (requerido)"
          className={styles.inputField}
          value={formData.username}
          onChange={handleChange}
          required
          aria-label="Nombre de usuario"
        />
        {/* 4. Correo Electrónico */}
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico (Opcional)"
          className={styles.inputField}
          value={formData.email}
          onChange={handleChange}
          aria-label="Correo electrónico"
        />
        {/* 5. Contraseña */}
        <input
          type="password"
          name="password"
          placeholder="Contraseña (requerido)"
          className={styles.inputField}
          value={formData.password}
          onChange={handleChange}
          required
          aria-label="Contraseña"
        />
        {/* 6. Confirmar Contraseña */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar Contraseña (requerido)"
          className={styles.inputField}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          aria-label="Confirmar contraseña"
        />
        {/* 7. Número de Contacto (Teléfono) */}
        <input
          type="text"
          name="contacto"
          placeholder="Número de Contacto (ej. WhatsApp) (requerido)"
          className={styles.inputField}
          value={formData.contacto}
          onChange={handleChange}
          required
          aria-label="Número de contacto"
        />
        {/* 8. Dirección */}
        <input
          type="text"
          name="direccion"
          placeholder="Dirección (Opcional)"
          className={styles.inputField}
          value={formData.direccion}
          onChange={handleChange}
          aria-label="Dirección"
        />

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'REGISTRARME'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;