import React, { useState, useEffect, useRef } from 'react';
import styles from './ClienteDetailModal.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faUserPlus, faUserEdit, faExclamationCircle, faCameraRetro, faTrashAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Componente del modal para crear, ver o editar un cliente
const ClienteDetailModal = ({ isOpen, onClose, mode, initialData, onSave }) => {
    const [clienteData, setClienteData] = useState({
        nombre: '',
        apellido: '',
        contacto: '',
        email: '',
        direccion: '',
        username: '',
        password: '',
        foto_perfil_url: '', // Puede ser una URL o una cadena Base64 temporal
    });
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isResizing, setIsResizing] = useState(false); // Nuevo estado para el indicador de redimensionamiento

    const fileInputRef = useRef(null);

    // Efecto para inicializar el formulario
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setClienteData({
                    nombre: initialData.nombre || '',
                    apellido: initialData.apellido || '',
                    contacto: initialData.contacto || '',
                    email: initialData.email || '',
                    direccion: initialData.direccion || '',
                    username: initialData.username || '',
                    password: '',
                    foto_perfil_url: initialData.foto_perfil_url || '',
                });
            } else {
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
            setErrors({});
            setNotification({ message: '', type: '' });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setIsResizing(false); // Asegúrate de que el estado de redimensionamiento esté en falso al abrir
        }
    }, [isOpen, mode, initialData]);

    // Función para redimensionar la imagen antes de convertirla a Base64
    const resizeImage = (base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calcula nuevas dimensiones manteniendo la relación de aspecto
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convierte el canvas a Base64 con la calidad especificada
                // Usa 'image/jpeg' o 'image/png' dependiendo de si necesitas transparencia
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => {
                console.error("Error loading image for resizing:", error);
                resolve(base64Str); // Si hay un error, devuelve la cadena original
            };
        });
    };

    // Manejador de cambios en los inputs de texto del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setClienteData(prevData => ({
            ...prevData,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
        }
    };

    // Manejador de cambio para el input de archivo (foto de perfil)
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsResizing(true); // Activa el indicador de redimensionamiento
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    // Redimensiona la imagen antes de guardarla en el estado
                    const resizedBase64 = await resizeImage(reader.result);
                    setClienteData(prevData => ({
                        ...prevData,
                        foto_perfil_url: resizedBase64
                    }));
                    setErrors(prevErrors => ({ ...prevErrors, foto_perfil_url: '' }));
                } catch (error) {
                    console.error("Error al redimensionar la imagen:", error);
                    setNotification({ message: 'Error al procesar la imagen.', type: 'error' });
                    setClienteData(prevData => ({
                        ...prevData,
                        foto_perfil_url: initialData?.foto_perfil_url || '' // Vuelve al valor inicial o vacío
                    }));
                } finally {
                    setIsResizing(false); // Desactiva el indicador de redimensionamiento
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                setNotification({ message: 'Error al leer el archivo de imagen.', type: 'error' });
                setIsResizing(false);
            };
            reader.readAsDataURL(file); // Lee el archivo como una URL de datos (Base64)
        } else {
            setClienteData(prevData => ({
                ...prevData,
                foto_perfil_url: initialData?.foto_perfil_url || ''
            }));
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Resetea el input file si no se selecciona nada
            }
            setErrors(prevErrors => ({ ...prevErrors, foto_perfil_url: '' }));
        }
    };

    // Función para borrar la foto de perfil
    const handleClearPhoto = () => {
        setClienteData(prevData => ({
            ...prevData,
            foto_perfil_url: '' // Una cadena vacía le dice al backend que elimine la foto
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Resetea el input de tipo file
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
        if (clienteData.contacto.trim() && !/^\d{10,15}$/.test(clienteData.contacto)) {
            newErrors.contacto = 'El contacto debe ser un número de 10 a 15 dígitos.';
        }
        if (!clienteData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido.';
        }
        if (mode === 'create' && !clienteData.password.trim()) {
            newErrors.password = 'La contraseña es requerida.';
        } else if (mode === 'edit' && clienteData.password.trim() && clienteData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
        }
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
        if (clienteData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteData.email)) {
            newErrors.email = 'Formato de email inválido.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });

        if (isResizing) { // Evitar envío si la imagen aún se está procesando
            setNotification({ message: 'Por favor, espera a que la imagen termine de procesarse.', type: 'error' });
            return;
        }

        if (!validateForm()) {
            setNotification({ message: 'Por favor, corrige los errores en el formulario.', type: 'error' });
            return;
        }

        try {
            const dataToSave = { ...clienteData };
            if (mode === 'edit' && !dataToSave.password.trim()) {
                delete dataToSave.password;
            }
            await onSave(dataToSave);
        } catch (error) {
            console.error('Error en ClienteDetailModal al guardar:', error);
            setNotification({ message: error.message || 'Error al guardar el cliente.', type: 'error' });
        }
    };

    if (!isOpen) return null;

    const fullName = `${clienteData.nombre || ''} ${clienteData.apellido || ''}`.trim();

    // Determinar la URL de la imagen a mostrar
    const imageUrlToDisplay = isResizing 
        ? 'https://placehold.co/180x180/888888/FFFFFF?text=Cargando...' 
        : (clienteData.foto_perfil_url || 'https://placehold.co/180x180/A0A0A0/FFFFFF?text=Sin+Foto'); // Default placeholder

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
                    {notification.message && (
                        <div className={`${styles.modalNotification} ${styles[notification.type]}`}>
                            <FontAwesomeIcon icon={faExclamationCircle} className={styles.notificationIcon} />
                            <p>{notification.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Sección de Foto de Perfil */}
                        <div className={`${styles.formGroup} ${styles.photoUploadSection}`}>
                            <div className={styles.imagePreviewContainer}>
                                {isResizing ? (
                                    <div className={styles.resizingSpinner}>
                                        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                                        <p>Redimensionando...</p>
                                    </div>
                                ) : (
                                    <img 
                                        src={clienteData.foto_perfil_url || 'https://placehold.co/180x180/A0A0A0/FFFFFF?text=Sin+Foto'}
                                        alt="Foto de perfil" 
                                        className={styles.imagePreview}
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = 'https://placehold.co/180x180/A0A0A0/FFFFFF?text=Error';
                                        }}
                                    />
                                )}
                                <p className={styles.userFullName}>{fullName}</p>
                            </div>
                            
                            <div className={styles.photoInputContainer}>
                                <label htmlFor="foto_perfil" className={styles.photoUploadLabel}>
                                    <FontAwesomeIcon icon={faCameraRetro} className={styles.photoIcon} /> 
                                    {isResizing ? 'Procesando Imagen...' : 'Subir Foto de Perfil'}
                                </label>
                                <input
                                    type="file"
                                    id="foto_perfil"
                                    name="foto_perfil"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={styles.fileInput}
                                    ref={fileInputRef}
                                    disabled={isResizing} // Deshabilita mientras se redimensiona
                                />
                                {errors.foto_perfil_url && <p className={styles.errorText}>{errors.foto_perfil_url}</p>}

                                {(clienteData.foto_perfil_url || (mode === 'edit' && initialData?.foto_perfil_url)) && (
                                    <button type="button" onClick={handleClearPhoto} className={styles.clearPhotoButton} disabled={isResizing}>
                                        <FontAwesomeIcon icon={faTrashAlt} /> Borrar Foto
                                    </button>
                                )}
                            </div>
                        </div>

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
                                disabled={mode === 'edit'}
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
                            <button type="submit" className={styles.saveButton} disabled={isResizing}>
                                <FontAwesomeIcon icon={faSave} className={styles.buttonIcon} />
                                Guardar
                            </button>
                            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isResizing}>
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
