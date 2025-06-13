// client/src/components/TrabajoDetailModal/TrabajoDetailModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TrabajoDetailModal.module.css';

// Helper para formatear fechas desde ISO a input type="datetime-local" (YYYY-MM-DDTHH:MM)
const formatToDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return '';
    }
    // toISOString() devuelve YYYY-MM-DDTHH:mm:ss.sssZ
    // Slice para obtener YYYY-MM-DDTHH:MM
    return date.toISOString().slice(0, 16);
};

// Helper para convertir fecha de input type="datetime-local" a formato MySQL (YYYY-MM-DD HH:MM:SS)
const formatFromDatetimeLocal = (datetimeLocalString) => {
    if (!datetimeLocalString) return null;
    const date = new Date(datetimeLocalString); // Esto se interpreta en la zona horaria local
    if (isNaN(date.getTime())) {
        return null; // Si la fecha no es válida, devuelve null
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Incluimos segundos como '00' si no se usan

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


const TrabajoDetailModal = ({ isOpen, onClose, mode, initialData, onSave }) => {
    const [formData, setFormData] = useState({
        cotizacion_id: '',
        empleado_id: '',
        fecha_inicio_estimada: '',
        fecha_inicio_real: '',
        fecha_fin_estimada: '',
        fecha_fin_real: '',
        materiales_usados: '', // Se espera un string JSON aquí
        estado: 'Pendiente',
        horas_hombre_estimadas: '',
        costo_mano_obra: '',
        notas: '',
    });
    const [errors, setErrors] = useState({});
    const [cotizaciones, setCotizaciones] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [isLoadingLookups, setIsLoadingLookups] = useState(true);

    // Opciones para el select de estado (deben coincidir con el backend)
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
        // Cargar cotizaciones y empleados al abrir el modal
        const fetchLookups = async () => {
            setIsLoadingLookups(true);
            try {
                // Fetch cotizaciones (solo IDs y nombres de clientes para el select)
                const cotizacionesRes = await axios.get('/NOVO/cotizaciones?limit=9999');
                setCotizaciones(cotizacionesRes.data.data.map(cot => ({
                    id: cot.id_cotizacion,
                    label: `${cot.id_cotizacion.substring(0, 8)}... (Cliente: ${cot.cliente_nombre || ''} ${cot.cliente_apellido || ''})`
                })));

                // Fetch empleados (solo IDs y nombres para el select)
                const empleadosRes = await axios.get('/NOVO/empleados?limit=9999');
                setEmpleados(empleadosRes.data.data.map(emp => ({
                    id: emp.id_empleado,
                    label: `${emp.nombre} ${emp.apellido}`
                })));

            } catch (err) {
                console.error('Error al cargar datos para selectores:', err);
                // Manejar el error, quizás mostrar un mensaje al usuario
            } finally {
                setIsLoadingLookups(false);
            }
        };

        if (isOpen) {
            fetchLookups();
        }

    }, [isOpen]);

    // Inicializar el formulario con los datos iniciales (para edición) o resetearlo (para creación)
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                cotizacion_id: initialData.cotizacion_id || '',
                empleado_id: initialData.empleado_id || '',
                fecha_inicio_estimada: formatToDatetimeLocal(initialData.fecha_inicio_estimada),
                fecha_inicio_real: formatToDatetimeLocal(initialData.fecha_inicio_real),
                fecha_fin_estimada: formatToDatetimeLocal(initialData.fecha_fin_estimada),
                fecha_fin_real: formatToDatetimeLocal(initialData.fecha_fin_real),
                materiales_usados: initialData.materiales_usados ? JSON.stringify(initialData.materiales_usados, null, 2) : '',
                estado: initialData.estado || 'Pendiente',
                horas_hombre_estimadas: initialData.horas_hombre_estimadas || '',
                costo_mano_obra: initialData.costo_mano_obra || '',
                notas: initialData.notas || '',
            });
        } else {
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
        setErrors({});
    }, [mode, initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.cotizacion_id) newErrors.cotizacion_id = 'La cotización es requerida.';
        if (formData.horas_hombre_estimadas && isNaN(Number(formData.horas_hombre_estimadas))) {
            newErrors.horas_hombre_estimadas = 'Debe ser un número.';
        }
        if (formData.costo_mano_obra && isNaN(Number(formData.costo_mano_obra))) {
            newErrors.costo_mano_obra = 'Debe ser un número.';
        }
        if (formData.materiales_usados) {
            try {
                JSON.parse(formData.materiales_usados);
            } catch (e) {
                newErrors.materiales_usados = 'Formato JSON inválido para materiales usados.';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSave = { ...formData };

            dataToSave.fecha_inicio_estimada = formatFromDatetimeLocal(dataToSave.fecha_inicio_estimada);
            dataToSave.fecha_inicio_real = formatFromDatetimeLocal(dataToSave.fecha_inicio_real);
            dataToSave.fecha_fin_estimada = formatFromDatetimeLocal(dataToSave.fecha_fin_estimada);
            dataToSave.fecha_fin_real = formatFromDatetimeLocal(dataToSave.fecha_fin_real);

            if (dataToSave.materiales_usados) {
                try {
                    dataToSave.materiales_usados = JSON.parse(dataToSave.materiales_usados);
                } catch (e) {
                    console.error("Error final de parseo de materiales_usados antes de guardar:", e);
                    dataToSave.materiales_usados = null;
                }
            } else {
                dataToSave.materiales_usados = null;
            }

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
                    {isLoadingLookups ? (
                        <p>Cargando datos...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="cotizacion_id">Cotización Asociada:</label>
                                <select
                                    id="cotizacion_id"
                                    name="cotizacion_id"
                                    value={formData.cotizacion_id}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                    disabled={mode === 'edit'}
                                >
                                    <option value="">Seleccione una cotización</option>
                                    {cotizaciones.map(cot => (
                                        <option key={cot.id} value={cot.id}>{cot.label}</option>
                                    ))}
                                </select>
                                {errors.cotizacion_id && <p className={styles.errorText}>{errors.cotizacion_id}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="empleado_id">Empleado Responsable:</label>
                                <select
                                    id="empleado_id"
                                    name="empleado_id"
                                    value={formData.empleado_id}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                >
                                    <option value="">Seleccione un empleado (Opcional)</option>
                                    {empleados.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.label}</option>
                                    ))}
                                </select>
                                {errors.empleado_id && <p className={styles.errorText}>{errors.empleado_id}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="estado">Estado del Trabajo:</label>
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
                                {errors.estado && <p className={styles.errorText}>{errors.estado}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fecha_inicio_estimada">Fecha Inicio Estimada:</label>
                                <input
                                    type="datetime-local"
                                    id="fecha_inicio_estimada"
                                    name="fecha_inicio_estimada"
                                    value={formData.fecha_inicio_estimada}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                />
                                {errors.fecha_inicio_estimada && <p className={styles.errorText}>{errors.fecha_inicio_estimada}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fecha_inicio_real">Fecha Inicio Real:</label>
                                <input
                                    type="datetime-local"
                                    id="fecha_inicio_real"
                                    name="fecha_inicio_real"
                                    value={formData.fecha_inicio_real}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                />
                                {errors.fecha_inicio_real && <p className={styles.errorText}>{errors.fecha_inicio_real}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fecha_fin_estimada">Fecha Fin Estimada:</label>
                                <input
                                    type="datetime-local"
                                    id="fecha_fin_estimada"
                                    name="fecha_fin_estimada"
                                    value={formData.fecha_fin_estimada}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                />
                                {errors.fecha_fin_estimada && <p className={styles.errorText}>{errors.fecha_fin_estimada}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fecha_fin_real">Fecha Fin Real:</label>
                                <input
                                    type="datetime-local"
                                    id="fecha_fin_real"
                                    name="fecha_fin_real"
                                    value={formData.fecha_fin_real}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                />
                                {errors.fecha_fin_real && <p className={styles.errorText}>{errors.fecha_fin_real}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="horas_hombre_estimadas">Horas Hombre Estimadas:</label>
                                <input
                                    type="number"
                                    id="horas_hombre_estimadas"
                                    name="horas_hombre_estimadas"
                                    value={formData.horas_hombre_estimadas}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                />
                                {errors.horas_hombre_estimadas && <p className={styles.errorText}>{errors.horas_hombre_estimadas}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="costo_mano_obra">Costo Mano de Obra:</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="costo_mano_obra"
                                    name="costo_mano_obra"
                                    value={formData.costo_mano_obra}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                />
                                {errors.costo_mano_obra && <p className={styles.errorText}>{errors.costo_mano_obra}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="materiales_usados">Materiales Usados (JSON):</label>
                                <textarea
                                    id="materiales_usados"
                                    name="materiales_usados"
                                    value={formData.materiales_usados}
                                    onChange={handleChange}
                                    className={`${styles.inputField} ${styles.textareaField}`}
                                    rows="5"
                                    placeholder='Ej: {"madera": 10, "tornillos": 100}'
                                ></textarea>
                                {errors.materiales_usados && <p className={styles.errorText}>{errors.materiales_usados}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="notas">Notas Adicionales:</label>
                                <textarea
                                    id="notas"
                                    name="notas"
                                    value={formData.notas}
                                    onChange={handleChange}
                                    className={`${styles.inputField} ${styles.textareaField}`}
                                    rows="3"
                                ></textarea>
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrabajoDetailModal;