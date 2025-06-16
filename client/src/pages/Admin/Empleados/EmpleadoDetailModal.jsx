import React, { useState, useEffect } from 'react';
import styles from './EmpleadoDetailModal.module.css'; // Asegúrate de crear este archivo CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faUserPlus, faUserEdit, faEye } from '@fortawesome/free-solid-svg-icons';

// Componente del modal para crear, ver o editar un empleado
const EmpleadoDetailModal = ({ isOpen, onClose, mode, initialData, onSave }) => {
    // Estado local para los datos del formulario del empleado
    const [empleadoData, setEmpleadoData] = useState({
        nombre: '',
        apellido: '',
        cargo: '',
        contacto: '',
        username: '',
        password: '', // Importante: no cargar contraseña real, solo para nueva creación/cambio
        role: 'empleado', // Valor por defecto
        activo: true, // Valor por defecto
    });
    const [errors, setErrors] = useState({}); // Estado para errores de validación
    const [notification, setNotification] = useState({ message: '', type: '' }); // Para notificaciones dentro del modal

    // Efecto para inicializar el formulario cuando el modal se abre o cambia el modo/datos iniciales
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                // Si estamos editando y hay datos iniciales, precargar el formulario
                setEmpleadoData({
                    nombre: initialData.nombre || '',
                    apellido: initialData.apellido || '',
                    cargo: initialData.cargo || '',
                    contacto: initialData.contacto || '',
                    username: initialData.username || '',
                    // No precargamos la contraseña por seguridad. Se dejará vacía.
                    password: '',
                    role: initialData.role || 'empleado',
                    activo: initialData.activo !== undefined ? initialData.activo : true,
                });
            } else {
                // Si estamos creando, resetear el formulario a sus valores iniciales/por defecto
                setEmpleadoData({
                    nombre: '',
                    apellido: '',
                    cargo: '',
                    contacto: '',
                    username: '',
                    password: '',
                    role: 'empleado',
                    activo: true,
                });
            }
            setErrors({}); // Limpiar errores al abrir/cambiar modo
            setNotification({ message: '', type: '' }); // Limpiar notificaciones
        }
    }, [isOpen, mode, initialData]);

    // Manejador de cambios en los inputs del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEmpleadoData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar el error específico al empezar a escribir en el campo
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
        }
    };

    // Función de validación del formulario
    const validateForm = () => {
        const newErrors = {};
        if (!empleadoData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido.';
        }
        if (!empleadoData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido.';
        }
        // La contraseña es requerida solo al crear, o si se intenta actualizar al editar
        if (mode === 'create' && !empleadoData.password.trim()) {
            newErrors.password = 'La contraseña es requerida.';
        } else if (mode === 'edit' && empleadoData.password.trim() && empleadoData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
        }
        if (empleadoData.password.trim() && !/[A-Z]/.test(empleadoData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una mayúscula.';
        }
        if (empleadoData.password.trim() && !/[a-z]/.test(empleadoData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una minúscula.';
        }
        if (empleadoData.password.trim() && !/[0-9]/.test(empleadoData.password)) {
            newErrors.password = 'La contraseña debe contener al menos un número.';
        }
        if (empleadoData.password.trim() && !/[!@#$%^&*(),.?":{}|<>]/.test(empleadoData.password)) {
            newErrors.password = 'La contraseña debe contener al menos un carácter especial.';
        }
        if (empleadoData.contacto && !/^\d{10}$/.test(empleadoData.contacto) && !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(empleadoData.contacto)) {
            newErrors.contacto = 'El contacto debe ser un teléfono válido (10 dígitos) o un email válido.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' }); // Limpiar notificaciones anteriores

        if (!validateForm()) {
            setNotification({ message: 'Por favor, corrige los errores en el formulario.', type: 'error' });
            return;
        }

        try {
            // Eliminar la contraseña si está vacía en modo edición para no intentar actualizarla
            const dataToSave = { ...empleadoData };
            if (mode === 'edit' && !dataToSave.password.trim()) {
                delete dataToSave.password;
            }

            // Llamar a la función onSave proporcionada por el padre
            await onSave(dataToSave);
            // El padre se encargará de cerrar el modal y mostrar la notificación general
        } catch (error) {
            console.error('Error en EmpleadoDetailModal al guardar:', error);
            // Mostrar notificación de error específica del modal
            setNotification({ message: error.message || 'Error al guardar el empleado.', type: 'error' });
        }
    };

    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>
                        <FontAwesomeIcon icon={mode === 'create' ? faUserPlus : mode === 'edit' ? faUserEdit : faEye} className={styles.headerIcon} />
                        {mode === 'create' ? 'Crear Nuevo Empleado' : 'Editar Empleado'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {/* Notificación dentro del modal */}
                    {notification.message && (
                        <div className={`${styles.modalNotification} ${styles[notification.type]}`}>
                            {notification.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Campo Nombre */}
                        <div className={styles.formGroup}>
                            <label htmlFor="nombre">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={empleadoData.nombre}
                                onChange={handleChange}
                                className={styles.inputField}
                                required
                            />
                            {errors.nombre && <p className={styles.errorText}>{errors.nombre}</p>}
                        </div>

                        {/* Campo Apellido */}
                        <div className={styles.formGroup}>
                            <label htmlFor="apellido">Apellido:</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={empleadoData.apellido}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                        </div>

                        {/* Campo Cargo */}
                        <div className={styles.formGroup}>
                            <label htmlFor="cargo">Cargo:</label>
                            <input
                                type="text"
                                id="cargo"
                                name="cargo"
                                value={empleadoData.cargo}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                        </div>

                        {/* Campo Contacto */}
                        <div className={styles.formGroup}>
                            <label htmlFor="contacto">Contacto (Email/Teléfono):</label>
                            <input
                                type="text"
                                id="contacto"
                                name="contacto"
                                value={empleadoData.contacto}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                            {errors.contacto && <p className={styles.errorText}>{errors.contacto}</p>}
                        </div>

                        {/* Campo Username */}
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Nombre de Usuario:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={empleadoData.username}
                                onChange={handleChange}
                                className={styles.inputField}
                                required
                                disabled={mode === 'edit'} // No se permite cambiar el username en edición
                            />
                            {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                        </div>

                        {/* Campo Contraseña (solo si es nuevo o si se quiere cambiar) */}
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Contraseña {mode === 'edit' ? '(Dejar vacío para no cambiar)' : ''}:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={empleadoData.password}
                                onChange={handleChange}
                                className={styles.inputField}
                                required={mode === 'create'}
                            />
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                            {mode === 'edit' && <p className={styles.helpText}>Solo llena este campo si deseas cambiar la contraseña.</p>}
                        </div>

                        {/* Campo Rol */}
                        <div className={styles.formGroup}>
                            <label htmlFor="role">Rol:</label>
                            <select
                                id="role"
                                name="role"
                                value={empleadoData.role}
                                onChange={handleChange}
                                className={styles.selectField}
                            >
                                <option value="empleado">Empleado</option>
                                <option value="gerente">Gerente</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Campo Activo (Checkbox) */}
                        <div className={styles.formGroupCheckbox}>
                            <input
                                type="checkbox"
                                id="activo"
                                name="activo"
                                checked={empleadoData.activo}
                                onChange={handleChange}
                                className={styles.checkboxField}
                            />
                            <label htmlFor="activo">Activo</label>
                        </div>

                        <div className={styles.modalActions}>
                            <button type="submit" className={styles.saveButton}>
                                <FontAwesomeIcon icon={faSave} className={styles.buttonIcon} />
                                Guardar
                            </button>
                            <button type="button" onClick={onClose} className={styles.cancelButton}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmpleadoDetailModal;
