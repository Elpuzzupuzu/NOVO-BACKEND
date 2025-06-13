import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateCotizacion,
    deleteCotizacion,
    selectCotizacionesStatus,
    selectCotizacionesError,
    resetCotizacionesStatus,
} from '../../../features/cotizaciones/cotizacionesSlice';
import { selectUser } from '../../../features/auth/authSlice';
import styles from './CotizacionDetailModal.module.css';

const CotizacionDetailModal = ({ isOpen, onClose, cotizacion }) => {
    const dispatch = useDispatch();
    const status = useSelector(selectCotizacionesStatus);
    const error = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [localMessage, setLocalMessage] = useState(null);

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
                // Si el material_base_id es nulo, lo ponemos como cadena vacía para el input
                material_base_id: cotizacion.material_base_id || '',
                // Asegurar que los nuevos campos numéricos también se parseen si fueran editables
                monto_anticipo_pagado: parseFloat(cotizacion.monto_anticipo_pagado) || 0,
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
        setFormData(prevFormData => {
            // Manejo especial para campos numéricos que podrían ser vaciados
            let newValue = value;
            if (type === 'number') {
                // Si el valor es vacío, se guarda como cadena vacía para permitir borrado en el input
                // Si no es vacío, intenta parsear a float, si falla, usa 0
                newValue = value === '' ? '' : parseFloat(value) || 0;
            }

            return {
                ...prevFormData,
                [name]: type === 'checkbox' ? checked : newValue,
            };
        });
        setLocalMessage(null); // Limpiar mensaje al cambiar campo
    };

    const handleSave = () => {
        setLocalMessage(null); // Limpiar mensajes previos al intentar guardar

        // Crear una copia de formData para manipulación y validación
        const dataToUpdate = { ...formData };

        // --- ¡ELIMINACIONES CRÍTICAS DEL PAYLOAD! ---
        // Elimina el ID de la cotización, ya que va en la URL.
        delete dataToUpdate.id_cotizacion;

        // Elimina campos de relaciones (cliente y material) que no son columnas de la tabla 'cotizaciones'.
        delete dataToUpdate.cliente_nombre;
        delete dataToUpdate.cliente_apellido;
        delete dataToUpdate.material_nombre;

        // Elimina campos de fecha de solo lectura o campos que el backend maneja automáticamente.
        // `fecha_solicitud` y `fecha_pago_anticipo` no son editables en este modal.
        delete dataToUpdate.fecha_solicitud;
        delete dataToUpdate.fecha_pago_anticipo;
        delete dataToUpdate.monto_anticipo_pagado; // Si este campo tampoco es editable directamente por el usuario aquí
        delete dataToUpdate.metodo_pago_anticipo; // Si este campo tampoco es editable directamente por el usuario aquí
        // --- ¡NUEVO AJUSTE! Elimina fecha_actualizacion del payload ---
        // Este campo lo debe manejar el backend o la DB automáticamente.
        delete dataToUpdate.fecha_actualizacion;


        // --- Validaciones en el frontend antes de enviar ---
        if (!dataToUpdate.tipo_producto || dataToUpdate.tipo_producto.trim() === '') {
            setLocalMessage({ type: 'error', text: 'El campo Tipo de Producto es obligatorio.' });
            return;
        }
        if (!dataToUpdate.estado || dataToUpdate.estado.trim() === '') {
            setLocalMessage({ type: 'error', text: 'El campo Estado es obligatorio.' });
            return;
        }
        if (isNaN(dataToUpdate.total_estimado) || parseFloat(dataToUpdate.total_estimado) <= 0) {
            setLocalMessage({ type: 'error', text: 'Total Estimado debe ser un número positivo.' });
            return;
        }
        // Puedes añadir más validaciones según sea necesario, por ejemplo, para material_base_id si es obligatorio
        // if (!dataToUpdate.material_base_id || dataToUpdate.material_base_id.trim() === '') {
        //     setLocalMessage({ type: 'error', text: 'El campo Material Base ID es obligatorio.' });
        //     return;
        // }


        // Asegúrate de que todos los campos numéricos sean parseados justo antes de enviarlos.
        // Solo los campos que son realmente editables y que tu backend espera
        dataToUpdate.metros_estimados = parseFloat(dataToUpdate.metros_estimados) || 0;
        dataToUpdate.total_estimado = parseFloat(dataToUpdate.total_estimado) || 0;
        dataToUpdate.anticipo_requerido = parseFloat(dataToUpdate.anticipo_requerido) || 0;


        // --- Lógica de Negocio al Guardar ---
        // Si el anticipo es 0 o no válido, calcularlo basado en el total_estimado
        if (isNaN(dataToUpdate.anticipo_requerido) || dataToUpdate.anticipo_requerido <= 0) {
            dataToUpdate.anticipo_requerido = dataToUpdate.total_estimado * 0.5; // Tu lógica de anticipo
        }

        // Dispatch de la acción de actualización
        dispatch(updateCotizacion({ cotizacionId: cotizacion.id_cotizacion, updatedData: dataToUpdate }));
    };

    const handleDelete = () => {
        // Confirmación antes de eliminar para evitar eliminaciones accidentales
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cotización? Esta acción es irreversible.')) {
            dispatch(deleteCotizacion(cotizacion.id_cotizacion));
            onClose(); // Cerrar el modal inmediatamente después de iniciar la eliminación
        }
    };

    // Permisos de edición/eliminación basados en el rol del usuario
    const canEdit = user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin';
    const canDelete = user?.role === 'admin';

    // Función para renderizar un campo de texto o un input según el modo
    const renderField = (label, name, value, type = 'text', options = [], displayValueOverride = null) => {
        if (!editMode) {
            let displayValue = value;
            if (displayValueOverride !== null) {
                displayValue = displayValueOverride;
            } else if (type === 'date' && value) {
                // Formatear fechas para visualización
                displayValue = new Date(value).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                });
            } else if (type === 'checkbox') {
                displayValue = value ? 'Sí' : 'No';
            } else if (value === null || value === undefined || value === '') {
                displayValue = 'N/A';
            }
            return <p className={styles.fieldValue}>{displayValue}</p>;
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
                        <label className={styles.modalLabel}>Cliente:</label>
                        {/* Se sigue mostrando el nombre y apellido del cliente en modo vista */}
                        {renderField('Cliente ID', 'cliente_id', cotizacion.cliente_id, 'text', [],
                                     `${cotizacion.cliente_nombre || ''} ${cotizacion.cliente_apellido || ''}`.trim() || 'N/A')}
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
                        <label className={styles.modalLabel}>Material Base:</label>
                        {editMode ?
                            renderField('Material Base ID', 'material_base_id', formData.material_base_id) :
                            renderField('Material Base ID', 'material_base_id', cotizacion.material_base_id, 'text', [], cotizacion.material_nombre || 'N/A')}
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

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Estado:</label>
                        {renderField('Estado', 'estado', formData.estado, 'select', [
                            { value: 'Pendiente de Anticipo', label: 'Pendiente de Anticipo' },
                            { value: 'Anticipo Pagado - Agendado', label: 'Anticipo Pagado - Agendado' },
                            { value: 'Anticipo Pagado - En Cola', label: 'Anticipo Pagado - En Cola' },
                            { value: 'Rechazada', label: 'Rechazada' },
                            { value: 'Completada', label: 'Completada' },
                            { value: 'Cancelada', label: 'Cancelada' },
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

                    {/* Campos de pago y fecha de solicitud, actualmente de solo lectura */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Monto Anticipo Pagado:</label>
                        {renderField('Monto Anticipo Pagado', 'monto_anticipo_pagado', cotizacion.monto_anticipo_pagado, 'number')}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Método Pago Anticipo:</label>
                        {renderField('Método Pago Anticipo', 'metodo_pago_anticipo', cotizacion.metodo_pago_anticipo)}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Pago Anticipo:</label>
                        {renderField('Fecha Pago Anticipo', 'fecha_pago_anticipo', cotizacion.fecha_pago_anticipo, 'date')}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Solicitud:</label>
                        {renderField('Fecha Solicitud', 'fecha_solicitud', cotizacion.fecha_solicitud, 'date')}
                    </div>
                     {/* Fecha de Actualización, solo lectura */}
                     <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Última Actualización:</label>
                        {renderField('Fecha Actualización', 'fecha_actualizacion', cotizacion.fecha_actualizacion, 'date')}
                    </div>
                </div>

                <div className={styles.modalActions}>
                    {/* Botones de edición/guardado/cancelado */}
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
                    {/* Botón de eliminar (solo visible si no está en modo edición y tiene permisos) */}
                    {canDelete && !editMode && (
                        <button onClick={handleDelete} className={styles.deleteButton} disabled={status === 'loading'}>
                            Eliminar Cotización
                        </button>
                    )}
                    {/* Botón de cerrar modal */}
                    <button onClick={onClose} className={styles.closeModalButton} disabled={status === 'loading'}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CotizacionDetailModal;