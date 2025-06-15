import React, { useState, useEffect, useCallback } from 'react';
import styles from './MaterialDetailModal.module.css';

const MaterialDetailModal = ({
    isOpen,
    onClose,
    mode, // 'create' o 'edit'
    initialData, // Datos del material si estamos en modo 'edit'
    onSave, // Función para manejar el guardado del material
}) => {
    const [formData, setFormData] = useState({
        // id_material (PK) y codigo (UNIQUE) no se manejan en el formulario directamente si son generados por DB
        nombre: '',
        descripcion: '',
        unidad_medida: 'unidades', // Valor por defecto, se alinea con el campo `unidad_medida` de la tabla
        costo_por_unidad: '', // Renombrado de precio_unitario para coincidir con la tabla
        stock_actual: '', // Nuevo campo en el frontend para reflejar `stock_actual`
        disponible_para_cotizacion: true, // Nuevo campo BOOLEAN
        // fecha_creacion y fecha_actualizacion son manejadas por la base de datos
    });
    const [errors, setErrors] = useState({});

    // Opciones para unidad de medida (pueden ser dinámicas si vienen de una API)
    const unidadMedidaOptions = [
        'unidades',
        'metros',
        'litros',
        'kilogramos',
        'piezas',
        'cajas'
    ];

    useEffect(() => {
        if (isOpen) { // Solo resetear/cargar cuando el modal se abre
            if (mode === 'edit' && initialData) {
                setFormData({
                    nombre: initialData.nombre || '',
                    descripcion: initialData.descripcion || '',
                    unidad_medida: initialData.unidad_medida || 'unidades',
                    costo_por_unidad: initialData.costo_por_unidad !== null && initialData.costo_por_unidad !== undefined ? parseFloat(initialData.costo_por_unidad) : '', // Asegura número o vacío
                    stock_actual: initialData.stock_actual !== null && initialData.stock_actual !== undefined ? parseInt(initialData.stock_actual) : '', // Asegura entero o vacío
                    disponible_para_cotizacion: initialData.disponible_para_cotizacion === undefined ? true : initialData.disponible_para_cotizacion, // Default a true si no está definido
                });
            } else {
                // Modo 'create'
                setFormData({
                    nombre: '',
                    descripcion: '',
                    unidad_medida: 'unidades',
                    costo_por_unidad: '',
                    stock_actual: '',
                    disponible_para_cotizacion: true,
                });
            }
            setErrors({}); // Limpiar errores al abrir el modal
        }
    }, [mode, initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            let newValue = value;
            if (type === 'number') {
                // Para números, si el valor es vacío, lo mantenemos como '' para que el input sea controlable
                // El parseo final a Number o null se hace en handleSubmit
                newValue = value; // Mantener como string aquí
            } else if (type === 'checkbox') {
                newValue = checked;
            }
            return { ...prev, [name]: newValue };
        });
        // Limpiar error específico cuando el usuario cambia el campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = useCallback(() => {
        let newErrors = {};

        // Validaciones de campos obligatorios y tipo
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre del material es requerido.';
        }

        // costo_por_unidad es NOT NULL y DECIMAL
        const costoPorUnidadNum = parseFloat(formData.costo_por_unidad);
        if (formData.costo_por_unidad === '' || isNaN(costoPorUnidadNum) || costoPorUnidadNum < 0) {
            newErrors.costo_por_unidad = 'El costo unitario debe ser un número positivo (o cero).';
        }

        // stock_actual es NOT NULL (asumiendo que en DB es NOT NULL o que 0 es un valor aceptable)
        const stockActualNum = parseInt(formData.stock_actual);
        if (formData.stock_actual === '' || isNaN(stockActualNum) || stockActualNum < 0) {
            newErrors.stock_actual = 'El stock actual debe ser un número entero no negativo.';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSave = { ...formData };

            // Convertir números a tipo Number para la base de datos.
            // Si el input está vacío, convertimos a 0, ya que los campos son NOT NULL.
            dataToSave.costo_por_unidad = dataToSave.costo_por_unidad === '' ? 0 : parseFloat(dataToSave.costo_por_unidad);
            dataToSave.stock_actual = dataToSave.stock_actual === '' ? 0 : parseInt(dataToSave.stock_actual);
            
            // Si el nombre no está recortado, hazlo aquí antes de enviar
            dataToSave.nombre = dataToSave.nombre.trim();
            // Si la descripción está vacía, enviarla como null a la DB
            dataToSave.descripcion = dataToSave.descripcion.trim() || null; 

            onSave(dataToSave);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>{mode === 'create' ? 'Crear Nuevo Material' : 'Detalles del Material'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <form onSubmit={handleSubmit}>

                        {/* SECCIÓN: INFORMACIÓN BÁSICA DEL MATERIAL */}
                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>Información Básica</h3>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="nombre">Nombre del Material *</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.nombre ? styles.inputError : ''}`}
                                        placeholder="Ej: Madera pino"
                                    />
                                    {errors.nombre && <p className={styles.errorText}>{errors.nombre}</p>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="unidad_medida">Unidad de Medida</label>
                                    <select
                                        id="unidad_medida"
                                        name="unidad_medida"
                                        value={formData.unidad_medida}
                                        onChange={handleChange}
                                        className={styles.inputField}
                                    >
                                        {unidadMedidaOptions.map(option => (
                                            <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="costo_por_unidad">Costo Unitario ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="costo_por_unidad"
                                        name="costo_por_unidad"
                                        value={formData.costo_por_unidad}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.costo_por_unidad ? styles.inputError : ''}`}
                                        placeholder="0.00"
                                    />
                                    {errors.costo_por_unidad && <p className={styles.errorText}>{errors.costo_por_unidad}</p>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="stock_actual">Stock Actual *</label>
                                    <input
                                        type="number"
                                        id="stock_actual"
                                        name="stock_actual"
                                        value={formData.stock_actual}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${errors.stock_actual ? styles.inputError : ''}`}
                                        placeholder="0"
                                    />
                                    {errors.stock_actual && <p className={styles.errorText}>{errors.stock_actual}</p>}
                                </div>
                            </div>
                            
                            <div className={styles.formRowSingle}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="descripcion">Descripción</label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        className={`${styles.inputField} ${styles.textareaField}`}
                                        rows="3"
                                        placeholder="Descripción detallada del material..."
                                    />
                                </div>
                            </div>

                            <div className={styles.formRowSingle}>
                                <div className={styles.formGroup}>
                                    <input
                                        type="checkbox"
                                        id="disponible_para_cotizacion"
                                        name="disponible_para_cotizacion"
                                        checked={formData.disponible_para_cotizacion}
                                        onChange={handleChange}
                                        className={styles.checkboxField} // Clase CSS para el checkbox
                                    />
                                    <label htmlFor="disponible_para_cotizacion" className={styles.checkboxLabel}>Disponible para Cotización</label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button type="submit" className={styles.saveButton}>
                                {mode === 'create' ? 'Crear Material' : 'Guardar Cambios'}
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

export default MaterialDetailModal;