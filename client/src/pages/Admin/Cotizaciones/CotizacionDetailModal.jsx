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

import useClients from '../../../hooks/useClients';
import useMaterials from '../../../hooks/useMaterials';

const CotizacionDetailModal = ({ isOpen, onClose, cotizacion }) => {
    const dispatch = useDispatch();
    const status = useSelector(selectCotizacionesStatus);
    const error = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [localMessage, setLocalMessage] = useState(null);

    const { clients, loadingClients, clientsError } = useClients();
    const { materials, loadingMaterials, materialsError } = useMaterials();

    // Sincroniza el formData con la cotización prop y reinicia el modo edición
    useEffect(() => {
        if (cotizacion) {
            setFormData({
                ...cotizacion,
                // --- Formatear fechas para input type="date" (YYYY-MM-DD) y asegurar strings vacías si son null ---
                fecha_agendada: cotizacion.fecha_agendada ? new Date(cotizacion.fecha_agendada).toISOString().split('T')[0] : '',
                fecha_pago_anticipo: cotizacion.fecha_pago_anticipo ? new Date(cotizacion.fecha_pago_anticipo).toISOString().split('T')[0] : '',
                
                // --- Asegurar que los números sean tratados como tales, y vacíos ('') si son null/undefined para input ---
                metros_estimados: cotizacion.metros_estimados !== null ? parseFloat(cotizacion.metros_estimados) : '',
                total_estimado: cotizacion.total_estimado !== null ? parseFloat(cotizacion.total_estimado) : '',
                anticipo_requerido: cotizacion.anticipo_requerido !== null ? parseFloat(cotizacion.anticipo_requerido) : '',
                monto_anticipo_pagado: cotizacion.monto_anticipo_pagado !== null ? parseFloat(cotizacion.monto_anticipo_pagado) : '',

                // --- Asegurar strings vacías para campos de texto si son null/undefined ---
                material_base_id: cotizacion.material_base_id || '', 
                color_tela: cotizacion.color_tela || '',
                metodo_pago_anticipo: cotizacion.metodo_pago_anticipo || '', // string
                descripcion_diseno: cotizacion.descripcion_diseno || '',
                notas_adicionales: cotizacion.notas_adicionales || '',
                
                // --- Convertir a booleano para checkbox ---
                diseno_personalizado: !!cotizacion.diseno_personalizado, 
                
                // --- Campos de solo lectura que NO van a formData porque se renderizan directamente desde `cotizacion` ---
                // No los inicializamos aquí en formData
            });
            setEditMode(false); // Siempre inicia en modo vista
        }
    }, [cotizacion]);

    // useEffect para asegurar que el material_base_id se seleccione cuando los materiales estén cargados
    useEffect(() => {
        // Esta lógica puede ser simplificada si la inicialización en el primer useEffect ya es suficiente.
        // Solo es necesaria si `formData.material_base_id` necesita ser ajustado después de que `materials` cargue.
        if (editMode && cotizacion && !loadingMaterials && materials.length > 0 && cotizacion.material_base_id) {
            const materialExists = materials.some(m => m.value === cotizacion.material_base_id);
            if (materialExists && formData.material_base_id !== cotizacion.material_base_id) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    material_base_id: cotizacion.material_base_id,
                }));
            }
        }
    }, [cotizacion, materials, loadingMaterials, editMode, formData.material_base_id]);


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
            let newValue = value;
            if (type === 'number') {
                // Si el valor es vacío, lo mantenemos como '' para que el usuario pueda borrarlo
                // De lo contrario, lo parseamos a float, usando 0 si el parseo falla (ej. "abc")
                newValue = value === '' ? '' : (parseFloat(value) || 0);
            }

            return {
                ...prevFormData,
                [name]: type === 'checkbox' ? checked : newValue,
            };
        });
        setLocalMessage(null); // Limpiar mensaje al cambiar campo
    };

    const handleSave = () => {
        setLocalMessage(null);

        let dataToUpdate = { ...formData }; // Usar 'let' para permitir modificaciones posteriores

        console.log('1. formData at start of handleSave:', formData); // Debug: ¿Qué hay en formData al inicio?
        console.log('2. cotizacion.id_cotizacion:', cotizacion.id_cotizacion); // Debug: ID de la cotización

        // Campos que deben ser eliminados porque son solo para visualización o cálculo en el frontend
        // No deben enviarse al backend en el body de la petición PUT
        delete dataToUpdate.id_cotizacion;
        delete dataToUpdate.cliente_nombre;
        delete dataToUpdate.cliente_apellido;
        delete dataToUpdate.material_nombre;
        // Si tienes más campos que no se editan y no deben enviarse, agrégalos aquí.

        // --- Validaciones en el frontend antes de enviar ---
        if (!dataToUpdate.tipo_producto || dataToUpdate.tipo_producto.trim() === '') {
            setLocalMessage({ type: 'error', text: 'El campo Tipo de Producto es obligatorio.' });
            return;
        }
        if (!dataToUpdate.estado || dataToUpdate.estado.trim() === '') {
            setLocalMessage({ type: 'error', text: 'El campo Estado es obligatorio.' });
            return;
        }
        // Validar total_estimado después de parsearlo a número
        const totalEstimadoNum = parseFloat(dataToUpdate.total_estimado);
        if (isNaN(totalEstimadoNum) || totalEstimadoNum <= 0) {
            setLocalMessage({ type: 'error', text: 'Total Estimado debe ser un número positivo.' });
            return;
        }
        if (!dataToUpdate.cliente_id) {
            setLocalMessage({ type: 'error', text: 'El campo Cliente es obligatorio.' });
            return;
        }
        if (!dataToUpdate.material_base_id) {
            setLocalMessage({ type: 'error', text: 'El campo Material Base es obligatorio.' });
            return;
        }
        console.log('3. dataToUpdate after initial cleanup and validations:', dataToUpdate);


        // Asegúrate de que todos los campos numéricos sean parseados justo antes de enviarlos.
        // Si el valor es vacío, lo convertimos a null para la base de datos si es lo que espera tu backend.
        dataToUpdate.metros_estimados = dataToUpdate.metros_estimados === '' ? null : parseFloat(dataToUpdate.metros_estimados);
        dataToUpdate.total_estimado = dataToUpdate.total_estimado === '' ? null : parseFloat(dataToUpdate.total_estimado);
        dataToUpdate.anticipo_requerido = dataToUpdate.anticipo_requerido === '' ? null : parseFloat(dataToUpdate.anticipo_requerido);
        dataToUpdate.monto_anticipo_pagado = dataToUpdate.monto_anticipo_pagado === '' ? null : parseFloat(dataToUpdate.monto_anticipo_pagado);


        // --- MANEJO DE FECHAS CLAVE AQUÍ ---
        // Los inputs type="date" ya devuelven 'YYYY-MM-DD'.
        // Solo necesitamos asegurarnos de que si el valor es una cadena vacía, se envíe como `null` al backend.
        // Tu inicialización en useEffect ya asegura que el input recibe YYYY-MM-DD.
        // El handleChange maneja el valor del input, que ya será YYYY-MM-DD.
        // Por lo tanto, solo necesitamos convertir '' a null.

        dataToUpdate.fecha_agendada = dataToUpdate.fecha_agendada || null;
        dataToUpdate.fecha_pago_anticipo = dataToUpdate.fecha_pago_anticipo || null;


        console.log('4. dataToUpdate RIGHT BEFORE DISPATCH (final values):', dataToUpdate); // Debug: Valor final antes del dispatch

        // Lógica de Negocio al Guardar
        // Si el anticipo requerido es NaN o <= 0, establecerlo al 50% del total estimado
        if (isNaN(dataToUpdate.anticipo_requerido) || dataToUpdate.anticipo_requerido <= 0) {
            dataToUpdate.anticipo_requerido = totalEstimadoNum * 0.5; // Usar totalEstimadoNum ya validado
        }
        
        // Dispatch de la acción de actualización
        dispatch(updateCotizacion({ cotizacionId: cotizacion.id_cotizacion, updatedData: dataToUpdate }));
    };

    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cotización? Esta acción es irreversible.')) {
            dispatch(deleteCotizacion(cotizacion.id_cotizacion));
            onClose();
        }
    };

    const canEdit = user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin';
    const canDelete = user?.role === 'admin';

    // renderField ajustado para manejar valores nulos/vacíos en modo edición y fechas.
    const renderField = (label, name, value, type = 'text', options = [], displayValueOverride = null) => {
        if (!editMode) {
            let displayValue = value;
            if (displayValueOverride !== null) {
                displayValue = displayValueOverride;
            } else if (type === 'date' && value) {
                // Formato de fecha para visualización (es-ES)
                // Asegurarse de que el valor sea una fecha válida antes de formatear
                const date = new Date(value);
                displayValue = isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                });
            } else if (type === 'checkbox') {
                displayValue = value ? 'Sí' : 'No';
            } else if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
                displayValue = 'N/A';
            }
            return <p className={styles.fieldValue}>{displayValue}</p>;
        }

        // Modo edición
        if (type === 'select') {
            return (
                <select name={name} value={value} onChange={handleChange} className={styles.modalInput}>
                    {/* Añadir opción por defecto para selects si es necesario */}
                    {options.length > 0 && !options.some(opt => opt.value === '') && <option value="">Selecciona una opción</option>}
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
        } else { // Esto cubre 'text', 'number', 'date', etc.
            return (
                <input
                    type={type}
                    name={name}
                    value={value} // Value debe ser lo que viene de formData, ya formateado
                    onChange={handleChange}
                    className={styles.modalInput}
                    // min y step solo para number inputs
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
                {loadingClients && <p>Cargando clientes...</p>}
                {clientsError && <p className={styles.errorMessage}>Error cargando clientes: {clientsError}</p>}
                {loadingMaterials && <p>Cargando materiales...</p>}
                {materialsError && <p className={styles.errorMessage}>Error cargando materiales: {materialsError}</p>}
                {status === 'loading' && <p className={styles.loadingMessage}>Guardando cambios...</p>}

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Cliente:</label>
                        {editMode ? (
                            <select
                                name="cliente_id"
                                value={formData.cliente_id || ''}
                                onChange={handleChange}
                                className={styles.modalInput}
                                disabled={loadingClients}
                            >
                                <option value="">Selecciona un cliente</option>
                                {clients.map(client => (
                                    <option key={client.value} value={client.value}>{client.label}</option>
                                ))}
                            </select>
                        ) : (
                            renderField('Cliente', 'cliente_id', cotizacion.cliente_id, 'text', [],
                                         `${cotizacion.cliente_nombre || ''} ${cotizacion.cliente_apellido || ''}`.trim() || 'N/A')
                        )}
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
                        {editMode ? (
                            <select
                                name="material_base_id"
                                value={formData.material_base_id || ''}
                                onChange={handleChange}
                                className={styles.modalInput}
                                disabled={loadingMaterials}
                            >
                                <option value="">Selecciona un material</option>
                                {materials.map(material => (
                                    <option key={material.value} value={material.value}>{material.label}</option>
                                ))}
                            </select>
                        ) : (
                            renderField('Material Base', 'material_base_id', cotizacion.material_base_id, 'text', [], cotizacion.material_nombre || 'N/A')
                        )}
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
                                { value: 'Cancelada', label: 'Cancelada' }, // Asegúrate que 'Cancelada' también es un ENUM en tu DB
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

                    {/* CAMPOS DE PAGO: Editables */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Monto Anticipo Pagado:</label>
                        {renderField('Monto Anticipo Pagado', 'monto_anticipo_pagado', formData.monto_anticipo_pagado, 'number')}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Método Pago Anticipo:</label>
                        {renderField('Método Pago Anticipo', 'metodo_pago_anticipo', formData.metodo_pago_anticipo)}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Pago Anticipo:</label>
                        {renderField('Fecha Pago Anticipo', 'fecha_pago_anticipo', formData.fecha_pago_anticipo, 'date')}
                    </div>

                    {/* Campos de Fecha de SOLO LECTURA (siempre muestran el valor de 'cotizacion' como texto) */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Solicitud:</label>
                        <p className={styles.fieldValue}>
                            {cotizacion.fecha_solicitud ? new Date(cotizacion.fecha_solicitud).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            }) : 'N/A'}
                        </p>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Última Actualización:</label>
                        <p className={styles.fieldValue}>
                            {cotizacion.fecha_actualizacion ? new Date(cotizacion.fecha_actualizacion).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            }) : 'N/A'}
                        </p>
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
                            <button onClick={handleSave} className={styles.saveButton} disabled={status === 'loading' || loadingClients || loadingMaterials}>
                                {status === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button onClick={() => setEditMode(false)} className={styles.cancelEditButton} disabled={status === 'loading'}>
                                Cancelar
                            </button>
                        </>
                    )}
                    {canDelete && !editMode && (
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