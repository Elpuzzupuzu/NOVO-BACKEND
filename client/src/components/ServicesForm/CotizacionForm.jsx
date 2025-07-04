import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    createCotizacion,
    selectCotizacionesStatus,
    selectCotizacionesError,
    resetCotizacionesStatus,
} from '../../features/cotizaciones/cotizacionesSlice';

import { selectUser } from '../../features/auth/authSlice';
import {
    fetchMaterials,
    selectAllMaterials,
    selectMaterialsStatus,
    selectMaterialsError
} from '../../features/materiales/materialsSlice';

import styles from './CotizacionForm.module.css';

const CotizacionForm = ({ onQuoteSubmit }) => {
    const dispatch = useDispatch();
    const cotizacionesStatus = useSelector(selectCotizacionesStatus);
    const cotizacionesError = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser);

    const materials = useSelector(selectAllMaterials);
    const materialsStatus = useSelector(selectMaterialsStatus);
    const materialsError = useSelector(selectMaterialsError);

    const [formData, setFormData] = useState({
        cliente_id: user?.id_cliente || '',
        tipo_producto: '',
        material_base_id: '',
        color_tela: '',
        diseno_personalizado: false,
        descripcion_diseno: '',
        notas_adicionales: '',
        fecha_agendada: ''
    });

    const [localSuccessMessage, setLocalSuccessMessage] = useState(null);

    // Actualiza cliente_id en el formData si el usuario de Redux cambia
    useEffect(() => {
        if (user && user.id_cliente) {
            setFormData(prev => ({ ...prev, cliente_id: user.id_cliente }));
        } else {
            setFormData(prev => ({ ...prev, cliente_id: '' }));
        }
    }, [user]);

    // Efecto para cargar los materiales cuando el componente se monta
    useEffect(() => {
        if (materialsStatus === 'idle') {
            dispatch(fetchMaterials());
        }
    }, [materialsStatus, dispatch]);

    // Manejar el estado del slice de cotizaciones y mostrar mensajes
    useEffect(() => {
        if (cotizacionesStatus === 'succeeded') {
            setLocalSuccessMessage('¡Cotización enviada con éxito! Nos pondremos en contacto pronto.');
            setFormData(prev => ({
                ...initialStateFormData(user),
                cliente_id: user?.id_cliente || '',
            }));
            if (onQuoteSubmit) {
                onQuoteSubmit();
            }
            dispatch(resetCotizacionesStatus());
        } else if (cotizacionesStatus === 'failed') {
            setLocalSuccessMessage(null);
        }

        const timer = setTimeout(() => {
            setLocalSuccessMessage(null);
        }, 5000);

        return () => clearTimeout(timer);
    }, [cotizacionesStatus, user, onQuoteSubmit, dispatch]);

    const initialStateFormData = (currentUser) => ({
        cliente_id: currentUser?.id_cliente || '',
        tipo_producto: '',
        material_base_id: '',
        color_tela: '',
        diseno_personalizado: false,
        descripcion_diseno: '',
        notas_adicionales: '',
        fecha_agendada: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.tipo_producto) {
                dispatch(createCotizacion.rejected(new Error('Por favor, completa el campo obligatorio: Tipo de Producto.').message));
                return;
            }
            
            if (!formData.cliente_id) {
                dispatch(createCotizacion.rejected(new Error('No se pudo determinar tu ID de cliente. Por favor, asegúrate de iniciar sesión.').message));
                return;
            }

            const dataToSend = { ...formData };

            // Aseguramos que total_estimado y anticipo_requerido se envíen
            if (!dataToSend.total_estimado) {
                dataToSend.total_estimado = 100.00;
            }
            if (!dataToSend.anticipo_requerido) {
                dataToSend.anticipo_requerido = dataToSend.total_estimado * 0.5;
            }

            dispatch(createCotizacion(dataToSend));

        } catch (err) {
            console.error('Error durante el envío (validación local previa al dispatch):', err);
            dispatch(createCotizacion.rejected(err.message));
        }
    };

    return (
        <div className={styles.cotizacionContainer}>
            <h2 className={styles.title}>Solicitar Cotización</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                {!user?.id_cliente && (
                    <div className={styles.formSection}>
                        <p className={styles.helpText}>
                            Para solicitar una cotización, por favor{' '}
                            <Link to="/login" className={styles.loginLink}>inicia sesión</Link>
                            {' '}o{' '}
                            <Link to="/register" className={styles.registerLink}>regístrate</Link>.
                        </p>
                    </div>
                )}
                
                {user?.id_cliente && (
                    <>
                        {/* Sección: Información del Servicio */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}></span>
                                Información del Servicio
                            </h3>
                            
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="tipo_producto" className={styles.label}>
                                        Tipo de Producto/Servicio *
                                    </label>
                                    <select
                                        id="tipo_producto"
                                        name="tipo_producto"
                                        value={formData.tipo_producto}
                                        onChange={handleChange}
                                        className={styles.select}
                                        required
                                    >
                                        <option value="">Selecciona un tipo</option>
                                        <option value="Tapicería de Asientos Automotriz">Tapicería de Asientos Automotriz</option>
                                        <option value="Tapicería de Volante">Tapicería de Volante</option>
                                        <option value="Tapicería de Muebles">Tapicería de Muebles</option>
                                        <option value="Restauración de Interiores (Auto)">Restauración de Interiores (Auto)</option>
                                        <option value="Diseño Personalizado">Diseño Personalizado</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_agendada" className={styles.label}>
                                        Fecha Preferida
                                    </label>
                                    <input
                                        type="date"
                                        id="fecha_agendada"
                                        name="fecha_agendada"
                                        value={formData.fecha_agendada}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                    <small className={styles.helpText}>
                                        Indica una fecha ideal para iniciar el servicio
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Sección: Materiales y Especificaciones */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}></span>
                                Materiales y Especificaciones
                            </h3>
                            
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="material_base_id" className={styles.label}>
                                        Material Preferido
                                    </label>
                                    <select
                                        id="material_base_id"
                                        name="material_base_id"
                                        value={formData.material_base_id}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        <option value="">Selecciona un material</option>
                                        {materialsStatus === 'loading' && <option disabled>Cargando materiales...</option>}
                                        {materialsError && <option disabled>Error al cargar materiales: {materialsError}</option>}
                                        {materialsStatus === 'succeeded' && materials.length === 0 && <option disabled>No hay materiales disponibles</option>}
                                        {materialsStatus === 'succeeded' && materials.map(material => (
                                            <option key={material.id_material} value={material.id_material}>
                                                {material.nombre} - ${material.costo_por_unidad}/{material.unidad_medida}
                                            </option>
                                        ))}
                                    </select>
                                    {materialsError && <p className={styles.errorMessage}>{materialsError}</p>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="color_tela" className={styles.label}>
                                        Color de Tela
                                    </label>
                                    <input
                                        type="text"
                                        id="color_tela"
                                        name="color_tela"
                                        value={formData.color_tela}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Ej: Negro, Beige, Rojo"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Diseño Personalizado */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}></span>
                                Personalización
                            </h3>
                            
                            <div className={styles.checkboxGroup} onClick={() => {
                                const checkbox = document.getElementById('diseno_personalizado');
                                if (checkbox) checkbox.click();
                            }}>
                                <input
                                    type="checkbox"
                                    id="diseno_personalizado"
                                    name="diseno_personalizado"
                                    checked={formData.diseno_personalizado}
                                    onChange={handleChange}
                                    className={styles.checkbox}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <label htmlFor="diseno_personalizado" className={styles.labelCheckbox}>
                                    ¿Requiere diseño personalizado?
                                </label>
                            </div>

                            {formData.diseno_personalizado && (
                                <div className={styles.designSection}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="descripcion_diseno" className={styles.label}>
                                            Descripción del Diseño Personalizado
                                        </label>
                                        <textarea
                                            id="descripcion_diseno"
                                            name="descripcion_diseno"
                                            value={formData.descripcion_diseno}
                                            onChange={handleChange}
                                            className={styles.textarea}
                                            rows="4"
                                            placeholder="Describa su diseño, incluya detalles o referencias..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección: Información Adicional */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}></span>
                                Información Adicional
                            </h3>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="notas_adicionales" className={styles.label}>
                                    Notas Adicionales
                                </label>
                                <textarea
                                    id="notas_adicionales"
                                    name="notas_adicionales"
                                    value={formData.notas_adicionales}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows="3"
                                    placeholder="Cualquier información extra relevante..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Mensajes de estado */}
                        {cotizacionesStatus === 'loading' && (
                            <div className={styles.message}>Enviando cotización...</div>
                        )}
                        {cotizacionesError && (
                            <div className={styles.errorMessage}>Error: {cotizacionesError}</div>
                        )}
                        {localSuccessMessage && (
                            <div className={styles.successMessage}>{localSuccessMessage}</div>
                        )}

                        <button 
                            type="submit" 
                            className={styles.submitButton} 
                            disabled={cotizacionesStatus === 'loading'}
                        >
                            {cotizacionesStatus === 'loading' ? 'Enviando...' : 'Enviar Cotización'}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default CotizacionForm;