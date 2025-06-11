import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateCotizacion,
    deleteCotizacion, // Para la opción de eliminar
    selectCotizacionesStatus,
    selectCotizacionesError,
    resetCotizacionesStatus,
} from '../../../features/cotizaciones/cotizacionesSlice';
import { selectUser } from '../../../features/auth/authSlice'; // Para verificar permisos de edición/eliminación
import styles from './CotizacionDetailModal.module.css';

const CotizacionDetailModal = ({ isOpen, onClose, cotizacion }) => {
    const dispatch = useDispatch();
    const status = useSelector(selectCotizacionesStatus);
    const error = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [localMessage, setLocalMessage] = useState(null); // Para mensajes de éxito/error dentro del modal

    // Sincroniza el formData con la cotización prop y reinicia el modo edición
    useEffect(() => {
        if (cotizacion) {
            setFormData({
                ...cotizacion,
                // Formatear la fecha para input type="date"
                fecha_agendada: cotizacion.fecha_agendada ? new Date(cotizacion.fecha_agendada).toISOString().split('T')[0] : '',
                // Asegurar que los números sean tratados como tales
                metros_estimados: parseFloat(cotizacion.metros_estimados) || 0,
                total_estimado: parseFloat(cotizacion.total_estimado) || 0,
                anticipo_requerido: parseFloat(cotizacion.anticipo_requerido) || 0,
            });
            setEditMode(false); // Siempre inicia en modo vista
        }
    }, [cotizacion]);

    // Manejar mensajes de éxito/error de las acciones de Redux
    useEffect(() => {
        if (status === 'succeeded') {
            setLocalMessage({ type: 'success', text: 'Operación exitosa!' });
            setEditMode(false); // Salir del modo edición después de guardar
            dispatch(resetCotizacionesStatus());
            // No cerramos el modal automáticamente, damos tiempo al usuario para ver el mensaje
        } else if (status === 'failed') {
            setLocalMessage({ type: 'error', text: error || 'Error en la operación.' });
            dispatch(resetCotizacionesStatus());
        }

        const timer = setTimeout(() => {
            setLocalMessage(null);
        }, 3000); // Limpiar mensaje después de 3 segundos

        return () => clearTimeout(timer);
    }, [status, error, dispatch]);


    if (!isOpen || !cotizacion) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setLocalMessage(null); // Limpiar mensaje al cambiar campo
    };

    const handleSave = () => {
        setLocalMessage(null);
        // Validación básica
        if (!formData.tipo_producto || !formData.estado || formData.total_estimado === undefined) {
            setLocalMessage({ type: 'error', text: 'Los campos Tipo de Producto, Estado y Total Estimado son obligatorios.' });
            return;
        }
        if (isNaN(formData.total_estimado) || formData.total_estimado < 0) {
            setLocalMessage({ type: 'error', text: 'Total estimado debe ser un número positivo.' });
            return;
        }

        // Si el anticipo es 0 o no válido, calcularlo basado en el total_estimado
        const dataToUpdate = { ...formData };
        if (isNaN(dataToUpdate.anticipo_requerido) || dataToUpdate.anticipo_requerido <= 0) {
            dataToUpdate.anticipo_requerido = parseFloat(dataToUpdate.total_estimado) * 0.5; // Ajusta tu lógica de anticipo
        }

        dispatch(updateCotizacion({ cotizacionId: cotizacion.id_cotizacion, updatedData: dataToUpdate }));
    };

    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cotización? Esta acción es irreversible.')) {
            dispatch(deleteCotizacion(cotizacion.id_cotizacion));
            // Si la eliminación es exitosa, el useEffect de CotizacionesGestionPage recargará la lista
            // Y el modal se cerrará automáticamente si el `cotizacion` prop se vuelve `null` o si onClose es llamado
            onClose(); // Cerrar el modal después de la eliminación
        }
    };

    // Permisos de edición/eliminación
    const canEdit = user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin';
    const canDelete = user?.role === 'admin';

    // Función para renderizar un campo de texto o un input según el modo
    const renderField = (label, name, value, type = 'text', options = []) => {
        if (!editMode) {
            // Formatear la fecha para la visualización
            if (type === 'date' && value) {
                return <p className={styles.fieldValue}>{new Date(value).toLocaleDateString()}</p>;
            }
            if (type === 'checkbox') {
                return <p className={styles.fieldValue}>{value ? 'Sí' : 'No'}</p>;
            }
            return <p className={styles.fieldValue}>{value || 'N/A'}</p>;
        }

        // Modo edición
        if (type === 'select') {
            return (
                <select name={name} value={value} onChange={handleChange} className={styles.modalInput}>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            );
        } else if (type === 'textarea') {
            return (
                <textarea
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className={styles.modalTextarea}
                    rows="3"
                ></textarea>
            );
        } else if (type === 'checkbox') {
            return (
                <input
                    type="checkbox"
                    name={name}
                    checked={value}
                    onChange={handleChange}
                    className={styles.modalCheckbox}
                />
            );
        } else {
            return (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className={styles.modalInput}
                    min={type === 'number' ? "0" : undefined}
                    step={type === 'number' ? "0.01" : undefined}
                />
            );
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2 className={styles.modalTitle}>
                    {editMode ? 'Editar Cotización' : 'Detalle de Cotización'}
                    <span className={styles.cotizacionId}>#{cotizacion.id_cotizacion.substring(0, 8)}...</span>
                </h2>

                {localMessage && (
                    <p className={`${styles.localMessage} ${localMessage.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
                        {localMessage.text}
                    </p>
                )}

                {status === 'loading' && <p className={styles.loadingMessage}>Guardando cambios...</p>}

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>ID Cliente:</label>
                        <p className={styles.fieldValue}>{cotizacion.cliente_id}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Tipo de Producto:</label>
                        {renderField('Tipo de Producto', 'tipo_producto', formData.tipo_producto, 'select', [
                            { value: '', label: 'Selecciona un tipo' },
                            { value: 'Tapicería de Asientos Automotriz', label: 'Tapicería de Asientos Automotriz' },
                            { value: 'Tapicería de Volante', label: 'Tapicería de Volante' },
                            { value: 'Tapicería de Muebles', label: 'Tapicería de Muebles' },
                            { value: 'Restauración de Interiores (Auto)', label: 'Restauración de Interiores (Auto)' },
                            { value: 'Diseño Personalizado', label: 'Diseño Personalizado' },
                            { value: 'Otro', label: 'Otro' },
                        ])}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Material Base ID:</label>
                        {renderField('Material Base ID', 'material_base_id', formData.material_base_id)}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Color de Tela:</label>
                        {renderField('Color de Tela', 'color_tela', formData.color_tela)}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Metros Estimados:</label>
                        {renderField('Metros Estimados', 'metros_estimados', formData.metros_estimados, 'number')}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Diseño Personalizado:</label>
                        {renderField('Diseño Personalizado', 'diseno_personalizado', formData.diseno_personalizado, 'checkbox')}
                    </div>

                    {formData.diseno_personalizado && (
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.modalLabel}>Descripción del Diseño:</label>
                            {renderField('Descripción del Diseño', 'descripcion_diseno', formData.descripcion_diseno, 'textarea')}
                        </div>
                    )}

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.modalLabel}>Notas Adicionales:</label>
                        {renderField('Notas Adicionales', 'notas_adicionales', formData.notas_adicionales, 'textarea')}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Agendada:</label>
                        {renderField('Fecha Agendada', 'fecha_agendada', formData.fecha_agendada, 'date')}
                    </div>

                    {/* Campos de Admin/Empleado */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Estado:</label>
                        {renderField('Estado', 'estado', formData.estado, 'select', [
                            { value: 'pendiente', label: 'Pendiente' },
                            { value: 'en_revision', label: 'En Revisión' },
                            { value: 'aprobada', label: 'Aprobada' },
                            { value: 'rechazada', label: 'Rechazada' },
                            { value: 'completada', label: 'Completada' },
                            { value: 'cancelada', label: 'Cancelada' },
                        ])}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Total Estimado:</label>
                        {renderField('Total Estimado', 'total_estimado', formData.total_estimado, 'number')}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Anticipo Requerido:</label>
                        {renderField('Anticipo Requerido', 'anticipo_requerido', formData.anticipo_requerido, 'number')}
                    </div>
                </div>

                <div className={styles.modalActions}>
                    {canEdit && !editMode && (
                        <button onClick={() => setEditMode(true)} className={styles.editButton}>
                            Editar
                        </button>
                    )}
                    {canEdit && editMode && (
                        <>
                            <button onClick={handleSave} className={styles.saveButton} disabled={status === 'loading'}>
                                {status === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button onClick={() => setEditMode(false)} className={styles.cancelEditButton} disabled={status === 'loading'}>
                                Cancelar
                            </button>
                        </>
                    )}
                    {canDelete && !editMode && ( // Solo permitir eliminar en modo vista
                        <button onClick={handleDelete} className={styles.deleteButton} disabled={status === 'loading'}>
                            Eliminar Cotización
                        </button>
                    )}
                    <button onClick={onClose} className={styles.closeModalButton} disabled={status === 'loading'}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CotizacionDetailModal;
