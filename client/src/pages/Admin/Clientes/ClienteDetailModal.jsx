import React, { useState, useEffect } from 'react';
import styles from './ClienteDetailModal.module.css'; // Asegúrate de que este archivo CSS exista
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faUserPlus, faUserEdit, faExclamationCircle, faCameraRetro } from '@fortawesome/free-solid-svg-icons';
import Footer from '../../../components/Footer/Footer'
// Componente del modal para crear, ver o editar un cliente
const ClienteDetailModal = ({ isOpen, onClose, mode, initialData, onSave }) => {
    // Estado local para los datos del formulario del cliente
    const [clienteData, setClienteData] = useState({
        nombre: '',
        apellido: '',
        contacto: '', // WhatsApp o teléfono
        email: '',
        direccion: '',
        username: '',
        password: '', // Importante: no cargar contraseña real, solo para nueva creación/cambio
        foto_perfil_url: '',
    });
    const [errors, setErrors] = useState({}); // Estado para errores de validación
    const [notification, setNotification] = useState({ message: '', type: '' }); // Para notificaciones dentro del modal

    // Efecto para inicializar el formulario cuando el modal se abre o cambia el modo/datos iniciales
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                // Si estamos editando y hay datos iniciales, precargar el formulario
                setClienteData({
                    nombre: initialData.nombre || '',
                    apellido: initialData.apellido || '',
                    contacto: initialData.contacto || '',
                    email: initialData.email || '',
                    direccion: initialData.direccion || '',
                    username: initialData.username || '',
                    password: '', // Nunca precargar la contraseña existente por seguridad
                    foto_perfil_url: initialData.foto_perfil_url || '',
                });
            } else {
                // Si estamos creando, resetear el formulario a sus valores iniciales/por defecto
                setClienteData({
                    nombre: '',
                    apellido: '',
                    contacto: '',
                    email: '',
                    direccion: '',
                    username: '',
                    password: '',
                    foto_perfil_url: '',
                });
            }
            setErrors({}); // Limpiar errores al abrir/cambiar modo
            setNotification({ message: '', type: '' }); // Limpiar notificaciones
        }
    }, [isOpen, mode, initialData]);

    // Manejador de cambios en los inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setClienteData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Limpiar el error específico al empezar a escribir en el campo
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
        }
    };

    // Función de validación del formulario
    const validateForm = () => {
        const newErrors = {};
        if (!clienteData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido.';
        }
        if (!clienteData.contacto.trim()) {
            newErrors.contacto = 'El contacto es requerido (WhatsApp/Teléfono).';
        }
        // Validación de contacto: 10-15 dígitos numéricos
        if (clienteData.contacto.trim() && !/^\d{10,15}$/.test(clienteData.contacto)) {
            newErrors.contacto = 'El contacto debe ser un número de 10 a 15 dígitos.';
        }
        if (!clienteData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido.';
        }
        // La contraseña es requerida solo al crear, o si se intenta actualizar al editar
        if (mode === 'create' && !clienteData.password.trim()) {
            newErrors.password = 'La contraseña es requerida.';
        } else if (mode === 'edit' && clienteData.password.trim() && clienteData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
        }
        // Validaciones de complejidad de contraseña (solo si se proporciona)
        if (clienteData.password.trim() && !/[A-Z]/.test(clienteData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una mayúscula.';
        }
        if (clienteData.password.trim() && !/[a-z]/.test(clienteData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una minúscula.';
        }
        if (clienteData.password.trim() && !/[0-9]/.test(clienteData.password)) {
            newErrors.password = 'La contraseña debe contener al menos un número.';
        }
        if (clienteData.password.trim() && !/[!@#$%^&*(),.?":{}|<>]/.test(clienteData.password)) {
            newErrors.password = 'La contraseña debe contener al menos un carácter especial.';
        }
        // Validación de formato de email
        if (clienteData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteData.email)) {
            newErrors.email = 'Formato de email inválido.';
        }
        // Validación de URL de foto de perfil
        if (clienteData.foto_perfil_url && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(clienteData.foto_perfil_url)) {
            newErrors.foto_perfil_url = 'URL de foto de perfil inválida. Debe ser una URL de imagen válida (http/https).';
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
            const dataToSave = { ...clienteData };
            if (mode === 'edit' && !dataToSave.password.trim()) {
                delete dataToSave.password;
            }
            // Asegurarse de que la URL de la foto de perfil sea null si está vacía
            if (!dataToSave.foto_perfil_url) {
                dataToSave.foto_perfil_url = null;
            }

            // Llamar a la función onSave proporcionada por el padre
            await onSave(dataToSave);
            // El padre se encargará de cerrar el modal y mostrar la notificación general
        } catch (error) {
            console.error('Error en ClienteDetailModal al guardar:', error);
            // Mostrar notificación de error específica del modal
            setNotification({ message: error.message || 'Error al guardar el cliente.', type: 'error' });
        }
    };

    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    const fullName = `${clienteData.nombre || ''} ${clienteData.apellido || ''}`.trim();

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>
                        <FontAwesomeIcon icon={mode === 'create' ? faUserPlus : faUserEdit} className={styles.headerIcon} />
                        {mode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {/* Notificación dentro del modal */}
                    {notification.message && (
                        <div className={`${styles.modalNotification} ${styles[notification.type]}`}>
                            <FontAwesomeIcon icon={faExclamationCircle} className={styles.notificationIcon} />
                            <p>{notification.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Sección de Foto de Perfil (mejorada con nueva disposición) */}
                        <div className={`${styles.formGroup} ${styles.photoUploadSection}`}>
                            {/* Contenedor de imagen a la izquierda */}
                            <div className={styles.imagePreviewContainer}>
                                {(clienteData.foto_perfil_url || (mode === 'edit' && initialData?.foto_perfil_url)) ? (
                                    <img 
                                        src={clienteData.foto_perfil_url || initialData?.foto_perfil_url} 
                                        alt="Foto de perfil" 
                                        className={styles.imagePreview}
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = 'https://placehold.co/180x180/A0A0A0/FFFFFF?text=Error'; // Placeholder para errores
                                        }}
                                    />
                                ) : (
                                    // Este div vacío permitirá que el pseudo-elemento ::after del CSS funcione
                                    <div className={styles.imagePreview}></div> 
                                )}
                                {/* Nombre completo debajo de la foto */}
                                <p className={styles.userFullName}>{fullName}</p>
                            </div>
                            
                            {/* Contenedor de input y label a la derecha */}
                            <div className={styles.photoInputContainer}>
                                <label htmlFor="foto_perfil_url" className={styles.photoUploadLabel}>
                                    <FontAwesomeIcon icon={faCameraRetro} className={styles.photoIcon} /> 
                                    Foto de Perfil (URL)
                                </label>
                                <input
                                    type="url"
                                    id="foto_perfil_url"
                                    name="foto_perfil_url"
                                    value={clienteData.foto_perfil_url}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                    placeholder="Ej: https://example.com/mi_foto.jpg"
                                />
                                {errors.foto_perfil_url && <p className={styles.errorText}>{errors.foto_perfil_url}</p>}
                            </div>
                        </div>

                        {/* Campos de Información General (2 columnas) */}
                        <div className={styles.formGroup}>
                            <label htmlFor="nombre">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={clienteData.nombre}
                                onChange={handleChange}
                                className={styles.inputField}
                                required
                            />
                            {errors.nombre && <p className={styles.errorText}>{errors.nombre}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="apellido">Apellido:</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={clienteData.apellido}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="contacto">Contacto (WhatsApp/Teléfono):</label>
                            <input
                                type="text"
                                id="contacto"
                                name="contacto"
                                value={clienteData.contacto}
                                onChange={handleChange}
                                className={styles.inputField}
                                required
                            />
                            {errors.contacto && <p className={styles.errorText}>{errors.contacto}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={clienteData.email}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                        </div>

                        {/* Campo Dirección (full width) */}
                        <div className={`${styles.formGroup} ${styles.formGroupFullWidth}`}>
                            <label htmlFor="direccion">Dirección:</label>
                            <textarea
                                id="direccion"
                                name="direccion"
                                value={clienteData.direccion}
                                onChange={handleChange}
                                className={styles.textareaField}
                                rows="3"
                            ></textarea>
                        </div>

                        {/* Campos de Credenciales (full width) */}
                        <div className={`${styles.formGroup} ${styles.formGroupFullWidth}`}>
                            <label htmlFor="username">Nombre de Usuario:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={clienteData.username}
                                onChange={handleChange}
                                className={styles.inputField}
                                required
                                disabled={mode === 'edit'} // No se permite cambiar el username en edición
                            />
                            {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                        </div>

                        <div className={`${styles.formGroup} ${styles.formGroupFullWidth}`}>
                            <label htmlFor="password">Contraseña {mode === 'edit' ? '(Dejar vacío para no cambiar)' : ''}:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={clienteData.password}
                                onChange={handleChange}
                                className={styles.inputField}
                                required={mode === 'create'}
                            />
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                            {mode === 'edit' && <p className={styles.helpText}>Solo llena este campo si deseas cambiar la contraseña.</p>}
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

export default ClienteDetailModal;
