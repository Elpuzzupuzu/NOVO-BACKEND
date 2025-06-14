import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Aunque axios no se usa directamente en el modal, se mantiene por si en el futuro se añade alguna llamada directa aquí.
import styles from './TrabajoDetailModal.module.css';

// Helper para formatear fechas desde ISO a input type="datetime-local" (YYYY-MM-DDTHH:MM)
const formatToDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Verificar si la fecha es válida para evitar 'Invalid Date' en el input
    if (isNaN(date.getTime())) {
        return '';
    }
    // slice(0, 16) recorta los segundos y la zona horaria, dejando YYYY-MM-DDTHH:MM
    return date.toISOString().slice(0, 16);
};

// Helper para convertir fecha de input type="datetime-local" a formato MySQL (YYYY-MM-DD HH:MM:SS)
const formatFromDatetimeLocal = (datetimeLocalString) => {
    if (!datetimeLocalString) return null; // Si está vacío, devuelve null para MySQL
    const date = new Date(datetimeLocalString);
    if (isNaN(date.getTime())) {
        return null; // Si es una fecha inválida, devuelve null
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Añadir segundos, generalmente '00' si no se especifican

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const TrabajoDetailModal = ({
    isOpen,
    onClose,
    mode,
    initialData,
    onSave,
    // cotizacionesOptions ahora no se usa para poblar un select dinámico aquí,
    // pero la mantenemos como prop si la pasas (aunque sea vacía).
    cotizacionesOptions = [],
    empleadosOptions = []
}) => {
    const [formData, setFormData] = useState({
        cotizacion_id: '',
        empleado_id: '',
        fecha_inicio_estimada: '',
        fecha_inicio_real: '',
        fecha_fin_estimada: '',
        fecha_fin_real: '',
        materiales_usados: '',
        estado: 'Pendiente',
        horas_hombre_estimadas: '',
        costo_mano_obra: '',
        notas: '',
    });
    const [errors, setErrors] = useState({});

    const estadoOptions = [
        'Pendiente',
        'En Proceso',
        'En Medición',
        'Listo para Entrega',
        'Entregado',
        'Cancelado',
        'Completada'
    ];

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                cotizacion_id: initialData.cotizacion_id || '',
                empleado_id: initialData.empleado_id || '',
                fecha_inicio_estimada: formatToDatetimeLocal(initialData.fecha_inicio_estimada),
                fecha_inicio_real: formatToDatetimeLocal(initialData.fecha_inicio_real),
                fecha_fin_estimada: formatToDatetimeLocal(initialData.fecha_fin_estimada),
                fecha_fin_real: formatToDatetimeLocal(initialData.fecha_fin_real),
                // Asegurarse de que materiales_usados es una cadena JSON válida o vacía
                materiales_usados: initialData.materiales_usados ? JSON.stringify(initialData.materiales_usados, null, 2) : '',
                estado: initialData.estado || 'Pendiente',
                horas_hombre_estimadas: initialData.horas_hombre_estimadas !== null ? String(initialData.horas_hombre_estimadas) : '',
                costo_mano_obra: initialData.costo_mano_obra !== null ? String(initialData.costo_mano_obra) : '',
                notas: initialData.notas || '',
            });
        } else {
            // Reiniciar el formulario al modo 'create' o cuando se abre el modal por primera vez en create mode
            setFormData({
                cotizacion_id: '',
                empleado_id: '',
                fecha_inicio_estimada: '',
                fecha_inicio_real: '',
                fecha_fin_estimada: '',
                fecha_fin_real: '',
                materiales_usados: '',
                estado: 'Pendiente',
                horas_hombre_estimadas: '',
                costo_mano_obra: '',
                notas: '',
            });
        }
        setErrors({}); // Limpiar errores al abrir o cambiar de modo
    }, [mode, initialData, isOpen]); // Dependencias del useEffect

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar el error cuando el usuario empieza a escribir en el campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        let newErrors = {};

        // Validación de cotizacion_id (asumiendo que es requerida)
        if (!formData.cotizacion_id) {
            newErrors.cotizacion_id = 'La cotización es requerida.';
        }

        // Validación para campos numéricos
        if (formData.horas_hombre_estimadas !== '' && isNaN(Number(formData.horas_hombre_estimadas))) {
            newErrors.horas_hombre_estimadas = 'Debe ser un número válido.';
        }
        if (formData.costo_mano_obra !== '' && isNaN(Number(formData.costo_mano_obra))) {
            newErrors.costo_mano_obra = 'Debe ser un número válido.';
        }

        // Validación para JSON de materiales_usados
        if (formData.materiales_usados) {
            try {
                JSON.parse(formData.materiales_usados);
            } catch (e) {
                newErrors.materiales_usados = 'Formato JSON inválido para materiales usados. Ejemplo: {"item": cantidad}.';
            }
        }

        // --- Validaciones de Fechas ---
        const inicioEstimada = formData.fecha_inicio_estimada ? new Date(formData.fecha_inicio_estimada) : null;
        const finEstimada = formData.fecha_fin_estimada ? new Date(formData.fecha_fin_estimada) : null;
        const inicioReal = formData.fecha_inicio_real ? new Date(formData.fecha_inicio_real) : null;
        const finReal = formData.fecha_fin_real ? new Date(formData.fecha_fin_real) : null;

        // Fecha de inicio estimada no puede ser posterior a la fecha de fin estimada
        if (inicioEstimada && finEstimada && inicioEstimada > finEstimada) {
            newErrors.fecha_fin_estimada = 'La fecha de fin estimada no puede ser anterior a la fecha de inicio estimada.';
        }

        // Fecha de inicio real no puede ser posterior a la fecha de fin real
        if (inicioReal && finReal && inicioReal > finReal) {
            newErrors.fecha_fin_real = 'La fecha de fin real no puede ser anterior a la fecha de inicio real.';
        }

        // Fecha de inicio real no puede ser anterior a la fecha de inicio estimada
        if (inicioReal && inicioEstimada && inicioReal < inicioEstimada) {
            newErrors.fecha_inicio_real = 'La fecha de inicio real no puede ser anterior a la fecha de inicio estimada.';
        }

        // Fecha de fin real no puede ser anterior a la fecha de fin estimada
        if (finReal && finEstimada && finReal < finEstimada) {
            newErrors.fecha_fin_real = 'La fecha de fin real no puede ser anterior a la fecha de fin estimada.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSave = { ...formData };

            // Convertir fechas a formato MySQL o null si están vacías
            dataToSave.fecha_inicio_estimada = formatFromDatetimeLocal(dataToSave.fecha_inicio_estimada);
            dataToSave.fecha_inicio_real = formatFromDatetimeLocal(dataToSave.fecha_inicio_real);
            dataToSave.fecha_fin_estimada = formatFromDatetimeLocal(dataToSave.fecha_fin_estimada);
            dataToSave.fecha_fin_real = formatFromDatetimeLocal(dataToSave.fecha_fin_real);

            // Parsear materiales_usados o establecer a null
            if (dataToSave.materiales_usados) {
                try {
                    dataToSave.materiales_usados = JSON.parse(dataToSave.materiales_usados);
                } catch (e) {
                    console.error("Error al parsear materiales_usados antes de guardar:", e);
                    dataToSave.materiales_usados = null; // Si hay un error, se envía null
                }
            } else {
                dataToSave.materiales_usados = null; // Si está vacío, se envía null
            }

            // Convertir números o establecer a null
            dataToSave.horas_hombre_estimadas = dataToSave.horas_hombre_estimadas ? Number(dataToSave.horas_hombre_estimadas) : null;
            dataToSave.costo_mano_obra = dataToSave.costo_mano_obra ? Number(dataToSave.costo_mano_obra) : null;

            onSave(dataToSave);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>{mode === 'create' ? 'Crear Nuevo Trabajo' : 'Detalles del Trabajo'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <form onSubmit={handleSubmit}>

                        {/* SECCIÓN: INFORMACIÓN BÁSICA */}
                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>Información Básica</h3>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="cotizacion_id">Cotización Asociada *</label>
                                    <select
                                        id="cotizacion_id"
                                        name="cotizacion_id"
                                        value={formData.cotizacion_id}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.cotizacion_id ? styles.inputError : ''}`}
                                        disabled={mode === 'edit'}
                                    >
                                        <option value="">{formData.cotizacion_id ? `ID: ${formData.cotizacion_id}` : "Seleccione una cotización"}</option>
                                        {/* Si en el futuro se necesita un select con opciones dinámicas, deberán venir de props */}
                                        {/* cotizacionesOptions.map(cot => (
                                            <option key={cot.id} value={cot.id}>{cot.label}</option>
                                        )) */}
                                    </select>
                                    {errors.cotizacion_id && <p className={styles.errorText}>{errors.cotizacion_id}</p>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="empleado_id">Empleado Responsable</label>
                                    <select
                                        id="empleado_id"
                                        name="empleado_id"
                                        value={formData.empleado_id}
                                        onChange={handleChange}
                                        className={styles.inputField}
                                    >
                                        <option value="">Seleccione un empleado</option>
                                        {empleadosOptions.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formRowSingle}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="estado">Estado del Trabajo</label>
                                    <select
                                        id="estado"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        className={styles.inputField}
                                    >
                                        {estadoOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: PLANIFICACIÓN TEMPORAL */}
                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>Planificación Temporal</h3>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_inicio_estimada">Fecha Inicio Estimada</label>
                                    <input
                                        type="datetime-local"
                                        id="fecha_inicio_estimada"
                                        name="fecha_inicio_estimada"
                                        value={formData.fecha_inicio_estimada}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.fecha_inicio_estimada ? styles.inputError : ''}`}
                                    />
                                    {errors.fecha_inicio_estimada && <p className={styles.errorText}>{errors.fecha_inicio_estimada}</p>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_fin_estimada">Fecha Fin Estimada</label>
                                    <input
                                        type="datetime-local"
                                        id="fecha_fin_estimada"
                                        name="fecha_fin_estimada"
                                        value={formData.fecha_fin_estimada}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.fecha_fin_estimada ? styles.inputError : ''}`}
                                    />
                                    {errors.fecha_fin_estimada && <p className={styles.errorText}>{errors.fecha_fin_estimada}</p>}
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_inicio_real">Fecha Inicio Real</label>
                                    <input
                                        type="datetime-local"
                                        id="fecha_inicio_real"
                                        name="fecha_inicio_real"
                                        value={formData.fecha_inicio_real}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.fecha_inicio_real ? styles.inputError : ''}`}
                                    />
                                    {errors.fecha_inicio_real && <p className={styles.errorText}>{errors.fecha_inicio_real}</p>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_fin_real">Fecha Fin Real</label>
                                    <input
                                        type="datetime-local"
                                        id="fecha_fin_real"
                                        name="fecha_fin_real"
                                        value={formData.fecha_fin_real}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.fecha_fin_real ? styles.inputError : ''}`}
                                    />
                                    {errors.fecha_fin_real && <p className={styles.errorText}>{errors.fecha_fin_real}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: RECURSOS Y COSTOS */}
                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>Recursos y Costos</h3>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="horas_hombre_estimadas">Horas Hombre Estimadas</label>
                                    <input
                                        type="number"
                                        id="horas_hombre_estimadas"
                                        name="horas_hombre_estimadas"
                                        value={formData.horas_hombre_estimadas}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.horas_hombre_estimadas ? styles.inputError : ''}`}
                                        placeholder="0"
                                    />
                                    {errors.horas_hombre_estimadas && <p className={styles.errorText}>{errors.horas_hombre_estimadas}</p>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="costo_mano_obra">Costo Mano de Obra ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="costo_mano_obra"
                                        name="costo_mano_obra"
                                        value={formData.costo_mano_obra}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.costo_mano_obra ? styles.inputError : ''}`}
                                        placeholder="0.00"
                                    />
                                    {errors.costo_mano_obra && <p className={styles.errorText}>{errors.costo_mano_obra}</p>}
                                </div>
                            </div>

                            <div className={styles.formRowSingle}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="materiales_usados">Materiales Usados (Formato JSON)</label>
                                    <textarea
                                        id="materiales_usados"
                                        name="materiales_usados"
                                        value={formData.materiales_usados}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${styles.textareaField} ${errors.materiales_usados ? styles.inputError : ''}`}
                                        rows="4"
                                        placeholder='Ejemplo: {"madera": 10, "tornillos": 100, "pintura": 2}'
                                    />
                                    {errors.materiales_usados && <p className={styles.errorText}>{errors.materiales_usados}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: NOTAS ADICIONALES */}
                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>Información Adicional</h3>

                            <div className={styles.formRowSingle}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="notas">Notas y Observaciones</label>
                                    <textarea
                                        id="notas"
                                        name="notas"
                                        value={formData.notas}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${styles.textareaField}`}
                                        rows="3"
                                        placeholder="Agregar notas, observaciones o comentarios adicionales..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button type="submit" className={styles.saveButton}>
                                {mode === 'create' ? 'Crear Trabajo' : 'Guardar Cambios'}
                            </button>
                            <button type="button" className={styles.cancelButton} onClick={onClose}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TrabajoDetailModal;