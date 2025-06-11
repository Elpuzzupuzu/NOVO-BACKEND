import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Asegúrate de importar Link si lo usas
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCotizacionById,
    updateCotizacion,
    selectCotizacionById,
    selectCotizacionesStatus,
    selectCotizacionesError,
    resetCotizacionesStatus, // To clear status after success/failure
} from '../../../features/cotizaciones/cotizacionesSlice';
import { selectUser } from '../../../features/auth/authSlice'; // To get user roles for permissions
import styles from './CotizacionEditPage.module.css'; // Nuevo CSS para esta página

const CotizacionEditPage = () => {
    const { id_cotizacion } = useParams(); // Obtiene el ID de la cotización de la URL
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Selectores de Redux
    // Importante: selectCotizacionById espera el estado completo y el ID.
    // Asegúrate de que tu store de Redux tenga 'cotizaciones' como un slice.
    const cotizacion = useSelector((state) => selectCotizacionById(state, id_cotizacion));
    const cotizacionesStatus = useSelector(selectCotizacionesStatus);
    const cotizacionesError = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser); // Obtiene el objeto de usuario para verificar roles

    // Estado local para el formulario de edición
    const [formData, setFormData] = useState({
        // Inicializa con valores por defecto o con la cotización fetched
        tipo_producto: '',
        material_base_id: '',
        color_tela: '',
        metros_estimados: '',
        diseno_personalizado: false,
        descripcion_diseno: '',
        notas_adicionales: '',
        fecha_agendada: '',
        estado: 'pendiente', // Nuevo campo para el estado de la cotización
        total_estimado: 0,    // Nuevo campo para el total estimado
        anticipo_requerido: 0 // Nuevo campo para el anticipo
    });

    const [localMessage, setLocalMessage] = useState(null); // Mensajes de éxito/error locales

    // Hook para cargar la cotización cuando el componente se monta o el ID cambia
    useEffect(() => {
        // Solo despacha la carga si el estado es 'idle' o si la cotización no está en el store
        if (id_cotizacion && (cotizacionesStatus === 'idle' || !cotizacion)) {
            dispatch(fetchCotizacionById(id_cotizacion));
        }
    }, [id_cotizacion, cotizacionesStatus, cotizacion, dispatch]);

    // Hook para pre-llenar el formulario cuando la cotización se carga exitosamente
    useEffect(() => {
        if (cotizacion) {
            setFormData({
                tipo_producto: cotizacion.tipo_producto || '',
                material_base_id: cotizacion.material_base_id || '',
                color_tela: cotizacion.color_tela || '',
                metros_estimados: cotizacion.metros_estimados || '',
                diseno_personalizado: cotizacion.diseno_personalizado || false,
                descripcion_diseno: cotizacion.descripcion_diseno || '',
                notas_adicionales: cotizacion.notas_adicionales || '',
                // Formatear la fecha para input type="date"
                fecha_agendada: cotizacion.fecha_agendada ? new Date(cotizacion.fecha_agendada).toISOString().split('T')[0] : '',
                estado: cotizacion.estado || 'pendiente',
                total_estimado: cotizacion.total_estimado || 0,
                anticipo_requerido: cotizacion.anticipo_requerido || 0
            });
        }
    }, [cotizacion]);

    // Manejar mensajes de éxito/error después de una operación de Redux
    useEffect(() => {
        if (cotizacionesStatus === 'succeeded') {
            setLocalMessage({ type: 'success', text: '¡Cotización actualizada con éxito!' });
            dispatch(resetCotizacionesStatus()); // Resetea el estado para futuras operaciones
            // Opcional: Redirigir a una página de lista o detalle después de un tiempo
            // const timer = setTimeout(() => navigate('/admin/cotizaciones'), 2000);
            // return () => clearTimeout(timer);
        } else if (cotizacionesStatus === 'failed') {
            setLocalMessage({ type: 'error', text: cotizacionesError || 'Error al actualizar la cotización.' });
            dispatch(resetCotizacionesStatus());
        }

        // Limpiar mensajes locales después de un tiempo
        const msgTimer = setTimeout(() => setLocalMessage(null), 5000);
        return () => clearTimeout(msgTimer);
    }, [cotizacionesStatus, cotizacionesError, dispatch, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setLocalMessage(null); // Limpiar mensaje al cambiar un campo
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalMessage(null); // Limpia mensajes anteriores

        // Validación básica
        if (!formData.tipo_producto || !formData.estado || formData.total_estimado === undefined) {
            setLocalMessage({ type: 'error', text: 'Por favor, completa los campos obligatorios: Tipo de Producto, Estado y Total Estimado.' });
            return;
        }
        if (isNaN(parseFloat(formData.total_estimado)) || parseFloat(formData.total_estimado) < 0) {
            setLocalMessage({ type: 'error', text: 'Total estimado debe ser un número válido y positivo.' });
            return;
        }
        if (formData.anticipo_requerido !== undefined && (isNaN(parseFloat(formData.anticipo_requerido)) || parseFloat(formData.anticipo_requerido) < 0)) {
            setLocalMessage({ type: 'error', text: 'Anticipo requerido debe ser un número válido y positivo.' });
            return;
        }

        // Prepara los datos para enviar, asegurando que los números sean números
        const dataToUpdate = {
            ...formData,
            metros_estimados: formData.metros_estimados !== '' ? parseFloat(formData.metros_estimados) : null,
            total_estimado: parseFloat(formData.total_estimado),
            anticipo_requerido: formData.anticipo_requerido !== '' ? parseFloat(formData.anticipo_requerido) : null,
        };

        dispatch(updateCotizacion({ cotizacionId: id_cotizacion, updatedData: dataToUpdate }));
    };

    // Renderizar estados de carga y error iniciales (antes de que la cotización se cargue)
    if (cotizacionesStatus === 'loading' && !cotizacion) { // Carga inicial
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>Cargando cotización...</p>
            </div>
        );
    }

    if (cotizacionesError && !cotizacion) { // Error en la carga inicial
        return (
            <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>Error al cargar la cotización</h2>
                <p className={styles.errorMessage}>{cotizacionesError}</p>
                <button onClick={() => navigate('/admin/cotizaciones')} className={styles.backButton}>Volver a Cotizaciones</button>
            </div>
        );
    }

    // Si la cotización no se encuentra después de que la carga ha terminado
    if (!cotizacion && cotizacionesStatus === 'succeeded') {
        return (
            <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>Cotización no encontrada</h2>
                <p className={styles.errorMessage}>El ID de cotización proporcionado no existe.</p>
                <button onClick={() => navigate('/admin/cotizaciones')} className={styles.backButton}>Volver a Cotizaciones</button>
            </div>
        );
    }

    // Asegurarse de que el usuario tiene permisos para actualizar
    const canEdit = user?.role === 'empleado' || user?.role === 'gerente' || user?.role === 'admin';
    if (!canEdit) {
        return (
            <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>Acceso Denegado</h2>
                <p className={styles.errorMessage}>No tienes permisos para editar cotizaciones.</p>
                <button onClick={() => navigate('/admin/dashboard')} className={styles.backButton}>Volver al Dashboard</button>
            </div>
        );
    }

    // Renderizar el formulario una vez que la cotización está disponible
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>Editar Cotización <span className={styles.cotizacionId}>#{id_cotizacion?.substring(0, 8)}...</span></h1>
            
            {localMessage && (
                <p className={`${styles.message} ${localMessage.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
                    {localMessage.text}
                </p>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="cliente_id" className={styles.label}>ID de Cliente:</label>
                    <input
                        type="text"
                        id="cliente_id"
                        name="cliente_id"
                        value={cotizacion?.cliente_id || ''} // Mostrar el cliente_id de la cotización original
                        className={styles.input}
                        disabled // El ID del cliente no se debe modificar aquí
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="tipo_producto" className={styles.label}>Tipo de Producto/Servicio:</label>
                    <select
                        id="tipo_producto"
                        name="tipo_producto"
                        value={formData.tipo_producto}
                        onChange={handleChange}
                        className={styles.select}
                        required
                        disabled={cotizacionesStatus === 'loading'}
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
                    <label htmlFor="material_base_id" className={styles.label}>Material Base (ID):</label>
                    <input
                        type="text"
                        id="material_base_id"
                        name="material_base_id"
                        value={formData.material_base_id}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={cotizacionesStatus === 'loading'}
                        placeholder="ID del material, ej: cuero_genuino"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="color_tela" className={styles.label}>Color de Tela:</label>
                    <input
                        type="text"
                        id="color_tela"
                        name="color_tela"
                        value={formData.color_tela}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={cotizacionesStatus === 'loading'}
                        placeholder="Ej: Negro, Beige"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="metros_estimados" className={styles.label}>Metros Estimados:</label>
                    <input
                        type="number"
                        id="metros_estimados"
                        name="metros_estimados"
                        value={formData.metros_estimados}
                        onChange={handleChange}
                        className={styles.input}
                        min="0"
                        step="0.1"
                        disabled={cotizacionesStatus === 'loading'}
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="checkbox"
                        id="diseno_personalizado"
                        name="diseno_personalizado"
                        checked={formData.diseno_personalizado}
                        onChange={handleChange}
                        className={styles.checkbox}
                        disabled={cotizacionesStatus === 'loading'}
                    />
                    <label htmlFor="diseno_personalizado" className={styles.labelCheckbox}>Diseño Personalizado</label>
                </div>

                {formData.diseno_personalizado && (
                    <div className={styles.formGroup}>
                        <label htmlFor="descripcion_diseno" className={styles.label}>Descripción del Diseño:</label>
                        <textarea
                            id="descripcion_diseno"
                            name="descripcion_diseno"
                            value={formData.descripcion_diseno}
                            onChange={handleChange}
                            className={styles.textarea}
                            rows="3"
                            disabled={cotizacionesStatus === 'loading'}
                            placeholder="Describa el diseño personalizado..."
                        ></textarea>
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="notas_adicionales" className={styles.label}>Notas Adicionales:</label>
                    <textarea
                        id="notas_adicionales"
                        name="notas_adicionales"
                        value={formData.notas_adicionales}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows="3"
                        disabled={cotizacionesStatus === 'loading'}
                        placeholder="Añadir notas importantes..."
                    ></textarea>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="fecha_agendada" className={styles.label}>Fecha Agendada:</label>
                    <input
                        type="date"
                        id="fecha_agendada"
                        name="fecha_agendada"
                        value={formData.fecha_agendada}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={cotizacionesStatus === 'loading'}
                    />
                </div>

                {/* Campos específicos para el Admin/Empleado */}
                <div className={styles.formGroup}>
                    <label htmlFor="estado" className={styles.label}>Estado de la Cotización:</label>
                    <select
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className={styles.select}
                        required
                        disabled={cotizacionesStatus === 'loading'}
                    >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="total_estimado" className={styles.label}>Total Estimado:</label>
                    <input
                        type="number"
                        id="total_estimado"
                        name="total_estimado"
                        value={formData.total_estimado}
                        onChange={handleChange}
                        className={styles.input}
                        min="0"
                        step="0.01"
                        required
                        disabled={cotizacionesStatus === 'loading'}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="anticipo_requerido" className={styles.label}>Anticipo Requerido:</label>
                    <input
                        type="number"
                        id="anticipo_requerido"
                        name="anticipo_requerido"
                        value={formData.anticipo_requerido}
                        onChange={handleChange}
                        className={styles.input}
                        min="0"
                        step="0.01"
                        disabled={cotizacionesStatus === 'loading'}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={cotizacionesStatus === 'loading'}
                >
                    {cotizacionesStatus === 'loading' ? 'Actualizando...' : 'Actualizar Cotización'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/admin/cotizaciones')}
                    className={styles.cancelButton}
                    disabled={cotizacionesStatus === 'loading'}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default CotizacionEditPage;
