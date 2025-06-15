// client/src/components/TrabajoDetailModal/TrabajoDetailModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './TrabajoDetailModal.module.css';

// Helper para formatear fechas desde ISO a input type="datetime-local" (YYYY-MM-DDTHH:MM)
const formatToDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return '';
    }
    return date.toISOString().slice(0, 16);
};

// Helper para convertir fecha de input type="datetime-local" a formato MySQL (YYYY-MM-DD HH:MM:SS)
const formatFromDatetimeLocal = (datetimeLocalString) => {
    if (!datetimeLocalString) return null;
    const date = new Date(datetimeLocalString);
    if (isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const TrabajoDetailModal = ({
    isOpen,
    onClose,
    mode,
    initialData,
    onSave,
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
        // materiales_usados ahora será un array de objetos para el estado interno
        materiales_usados: [],
        estado: 'Pendiente',
        horas_hombre_estimadas: '',
        costo_mano_obra: '',
        notas: '',
    });

    // Nuevo estado para los inputs de añadir material
    const [currentMaterialName, setCurrentMaterialName] = useState('');
    const [currentMaterialQuantity, setCurrentMaterialQuantity] = useState('');

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
            // Convertir el JSON de materiales_usados a un array de objetos para el estado interno
            let parsedMateriales = [];
            if (initialData.materiales_usados && typeof initialData.materiales_usados === 'object') {
                // If it's already an object (from previous save), convert it to array
                parsedMateriales = Object.entries(initialData.materiales_usados).map(([material, cantidad]) => ({
                    material,
                    cantidad
                }));
            } else if (initialData.materiales_usados && typeof initialData.materiales_usados === 'string') {
                // If it's a string (e.g., from an initial load that wasn't parsed), try to parse
                try {
                    const parsed = JSON.parse(initialData.materiales_usados);
                    parsedMateriales = Object.entries(parsed).map(([material, cantidad]) => ({
                        material,
                        cantidad
                    }));
                } catch (e) {
                    console.error("Error parsing materials_usados from string:", e);
                    parsedMateriales = [];
                }
            }


            setFormData({
                cotizacion_id: initialData.cotizacion_id || '',
                empleado_id: initialData.empleado_id || '',
                fecha_inicio_estimada: formatToDatetimeLocal(initialData.fecha_inicio_estimada),
                fecha_inicio_real: formatToDatetimeLocal(initialData.fecha_inicio_real),
                fecha_fin_estimada: formatToDatetimeLocal(initialData.fecha_fin_estimada),
                fecha_fin_real: formatToDatetimeLocal(initialData.fecha_fin_real),
                materiales_usados: parsedMateriales, // Set as array
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
                materiales_usados: [], // Initialize as empty array
                estado: 'Pendiente',
                horas_hombre_estimadas: '',
                costo_mano_obra: '',
                notas: '',
            });
        }
        setErrors({});
        // Reset current material input fields
        setCurrentMaterialName('');
        setCurrentMaterialQuantity('');
    }, [mode, initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddMaterial = () => {
        if (!currentMaterialName.trim()) {
            setErrors(prev => ({ ...prev, currentMaterialName: 'El nombre del material es requerido.' }));
            return;
        }
        if (currentMaterialQuantity === '' || isNaN(Number(currentMaterialQuantity)) || Number(currentMaterialQuantity) <= 0) {
            setErrors(prev => ({ ...prev, currentMaterialQuantity: 'La cantidad debe ser un número positivo.' }));
            return;
        }

        setFormData(prev => {
            const newMaterials = [...prev.materiales_usados];
            const existingMaterialIndex = newMaterials.findIndex(
                (item) => item.material.toLowerCase() === currentMaterialName.trim().toLowerCase()
            );

            if (existingMaterialIndex > -1) {
                // If material already exists, update its quantity
                newMaterials[existingMaterialIndex].cantidad += Number(currentMaterialQuantity);
            } else {
                // Otherwise, add new material
                newMaterials.push({
                    material: currentMaterialName.trim(),
                    cantidad: Number(currentMaterialQuantity)
                });
            }
            return { ...prev, materiales_usados: newMaterials };
        });

        setCurrentMaterialName('');
        setCurrentMaterialQuantity('');
        setErrors(prev => ({ ...prev, currentMaterialName: '', currentMaterialQuantity: '' }));
    };

    const handleRemoveMaterial = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            materiales_usados: prev.materiales_usados.filter((_, index) => index !== indexToRemove)
        }));
    };


    const validateForm = useCallback(() => {
        let newErrors = {};

        // Validación de campos numéricos
        if (formData.horas_hombre_estimadas !== '' && isNaN(Number(formData.horas_hombre_estimadas))) {
            newErrors.horas_hombre_estimadas = 'Debe ser un número.';
        }
        if (formData.costo_mano_obra !== '' && isNaN(Number(formData.costo_mano_obra))) {
            newErrors.costo_mano_obra = 'Debe ser un número.';
        }

        // Validación de cotizacion_id (si es requerido para crear/editar)
        if (!formData.cotizacion_id) {
            newErrors.cotizacion_id = 'La cotización es requerida.';
        }

        // Ya no necesitamos validar el JSON en bruto, ya que lo gestionamos como un array de objetos.
        // La conversión a JSON se hará justo antes de guardar.

        // --- Validaciones de Fechas ---
        const fechaInicioEstimada = formData.fecha_inicio_estimada ? new Date(formData.fecha_inicio_estimada) : null;
        const fechaFinEstimada = formData.fecha_fin_estimada ? new Date(formData.fecha_fin_estimada) : null;
        const fechaInicioReal = formData.fecha_inicio_real ? new Date(formData.fecha_inicio_real) : null;
        const fechaFinReal = formData.fecha_fin_real ? new Date(formData.fecha_fin_real) : null;

        // 1. Fechas estimadas: inicio no puede ser posterior a fin
        if (fechaInicioEstimada && fechaFinEstimada && fechaInicioEstimada > fechaFinEstimada) {
            newErrors.fecha_fin_estimada = 'La fecha fin estimada no puede ser anterior a la fecha inicio estimada.';
        }

        // 2. Fechas reales: inicio no puede ser posterior a fin
        if (fechaInicioReal && fechaFinReal && fechaInicioReal > fechaFinReal) {
            newErrors.fecha_fin_real = 'La fecha fin real no puede ser anterior a la fecha inicio real.';
        }

        // 3. Fecha de inicio real no puede ser anterior a la fecha de inicio estimada (si ambas existen)
        if (fechaInicioEstimada && fechaInicioReal && fechaInicioReal < fechaInicioEstimada) {
            newErrors.fecha_inicio_real = 'La fecha de inicio real no puede ser anterior a la fecha de inicio estimada.';
        }

        // 4. Fecha de fin real no puede ser anterior a la fecha de fin estimada (si ambas existen)
        if (fechaFinEstimada && fechaFinReal && fechaFinReal < fechaFinEstimada) {
            newErrors.fecha_fin_real = 'La fecha de fin real no puede ser anterior a la fecha de fin estimada.';
        }

        // 5. Un trabajo "Completada" o "Entregado" debe tener fechas reales
        if (['Completada', 'Entregado'].includes(formData.estado)) {
            if (!formData.fecha_inicio_real) {
                newErrors.fecha_inicio_real = 'Se requiere una fecha de inicio real para un trabajo "Completada" o "Entregado".';
            }
            if (!formData.fecha_fin_real) {
                newErrors.fecha_fin_real = 'Se requiere una fecha de fin real para un trabajo "Completada" o "Entregado".';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSave = { ...formData };

            dataToSave.fecha_inicio_estimada = formatFromDatetimeLocal(dataToSave.fecha_inicio_estimada);
            dataToSave.fecha_inicio_real = formatFromDatetimeLocal(dataToSave.fecha_inicio_real);
            dataToSave.fecha_fin_estimada = formatFromDatetimeLocal(dataToSave.fecha_fin_estimada);
            dataToSave.fecha_fin_real = formatFromDatetimeLocal(dataToSave.fecha_fin_real);

            // Convertir el array de materiales a objeto JSON para la base de datos
            const materialesObject = {};
            formData.materiales_usados.forEach(item => {
                materialesObject[item.material] = item.cantidad;
            });
            dataToSave.materiales_usados = JSON.stringify(materialesObject); // Convert to JSON string

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
                                        <option value="">{formData.cotizacion_id || "Seleccione una cotización"}</option>
                                        {/* Como no hay un hook de cotizaciones, solo mostramos una opción predeterminada. */}
                                        {/* Si cotizacion_id se establece desde fuera (ej. al editar) se mostrará el valor. */}
                                        {cotizacionesOptions.map(cot => (
                                            <option key={cot.id} value={cot.id}>{cot.label}</option>
                                        ))}
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

                        {/* SECCIÓN: PLANIFICACIÓN TEMPORAL (sin cambios) */}
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

                            {/* Nueva interfaz para Materiales Usados */}
                            <div className={styles.formRowSingle}>
                                <div className={styles.formGroup}>
                                    <label>Materiales Usados</label>
                                    <div className={styles.materialInputGroup}>
                                        <input
                                            type="text"
                                            value={currentMaterialName}
                                            onChange={(e) => {
                                                setCurrentMaterialName(e.target.value);
                                                setErrors(prev => ({ ...prev, currentMaterialName: '' })); // Clear error on change
                                            }}
                                            placeholder="Nombre del material"
                                            className={`${styles.inputField} ${styles.smallInputField} ${errors.currentMaterialName ? styles.inputError : ''}`}
                                        />
                                        <input
                                            type="number"
                                            value={currentMaterialQuantity}
                                            onChange={(e) => {
                                                setCurrentMaterialQuantity(e.target.value);
                                                setErrors(prev => ({ ...prev, currentMaterialQuantity: '' })); // Clear error on change
                                            }}
                                            placeholder="Cantidad"
                                            className={`${styles.inputField} ${styles.smallInputField} ${errors.currentMaterialQuantity ? styles.inputError : ''}`}
                                        />
                                        <button type="button" onClick={handleAddMaterial} className={styles.addButton}>
                                            Agregar
                                        </button>
                                    </div>
                                    {errors.currentMaterialName && <p className={styles.errorText}>{errors.currentMaterialName}</p>}
                                    {errors.currentMaterialQuantity && <p className={styles.errorText}>{errors.currentMaterialQuantity}</p>}

                                    {formData.materiales_usados.length > 0 && (
                                        <div className={styles.materialList}>
                                            <h4>Materiales Agregados:</h4>
                                            <ul>
                                                {formData.materiales_usados.map((item, index) => (
                                                    <li key={index} className={styles.materialItem}>
                                                        {item.material}: {item.cantidad}
                                                        <button type="button" onClick={() => handleRemoveMaterial(index)} className={styles.removeButton}>
                                                            &times;
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: NOTAS ADICIONALES (sin cambios) */}
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