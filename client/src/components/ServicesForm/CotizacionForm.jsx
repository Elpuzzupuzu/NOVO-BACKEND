import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Importa los hooks de Redux
import {
    createCotizacion,
    selectCotizacionesStatus,
    selectCotizacionesError,
    resetCotizacionesStatus,
    // clearCotizacionesError // No es necesario si no lo usas activamente
} from '../../features/cotizaciones/cotizacionesSlice'; // Importa el thunk y los selectores desde tu slice

import { selectUser } from '../../features/auth/authSlice'; // Importa el selector para el usuario del authSlice

import styles from './CotizacionForm.module.css';

// El componente ya no necesita la prop 'clienteId'
const CotizacionForm = ({ onQuoteSubmit }) => {
    // Hooks de Redux
    const dispatch = useDispatch();
    const status = useSelector(selectCotizacionesStatus);
    const error = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser); // Obtiene el objeto de usuario del estado de autenticación

    // Añadido: console.log para ver la información del usuario
    console.log('User data from Redux:', user);

    // Estado local para el formulario
    const [formData, setFormData] = useState({
        // Inicializa cliente_id desde el usuario de Redux, si existe, o vacío
        cliente_id: user?.id_cliente || '', // Asume que el ID del cliente está en user.id_cliente
        tipo_producto: '',
        material_base_id: '',
        color_tela: '',
        metros_estimados: '',
        diseno_personalizado: false,
        descripcion_diseno: '',
        notas_adicionales: '',
        fecha_agendada: ''
    });

    const [localSuccessMessage, setLocalSuccessMessage] = useState(null);

    // Actualiza cliente_id en el formData si el usuario de Redux cambia (ej. al iniciar sesión)
    useEffect(() => {
        if (user && user.id_cliente) {
            setFormData(prev => ({ ...prev, cliente_id: user.id_cliente }));
        } else {
            // Si el usuario no está logueado o no tiene id_cliente, asegúrate de que el campo esté vacío
            setFormData(prev => ({ ...prev, cliente_id: '' }));
        }
    }, [user]); // Dependencia del useEffect es el objeto 'user' completo

    // Manejar el estado del slice y mostrar mensajes
    useEffect(() => {
        if (status === 'succeeded') {
            setLocalSuccessMessage('¡Cotización enviada con éxito! Nos pondremos en contacto pronto.');
            // Resetea el formulario después de un envío exitoso, manteniendo el cliente_id actual
            setFormData(prev => ({
                ...initialStateFormData(user), // Usa una función para obtener el estado inicial basado en el usuario
                cliente_id: user?.id_cliente || '', // Asegura que cliente_id se mantenga si se pasa por prop
            }));
            if (onQuoteSubmit) {
                onQuoteSubmit();
            }
            dispatch(resetCotizacionesStatus());
        } else if (status === 'failed') {
            setLocalSuccessMessage(null);
        }

        const timer = setTimeout(() => {
            setLocalSuccessMessage(null);
        }, 5000); // Borra el mensaje después de 5 segundos

        return () => clearTimeout(timer);
    }, [status, user, onQuoteSubmit, dispatch]);

    // Función auxiliar para resetear el formData, manteniendo el cliente_id si el usuario está logueado
    const initialStateFormData = (currentUser) => ({
        cliente_id: currentUser?.id_cliente || '',
        tipo_producto: '',
        material_base_id: '',
        color_tela: '',
        metros_estimados: '',
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
            
            // Validación crucial: Asegúrate de que tenemos un cliente_id antes de enviar
            if (!formData.cliente_id) {
                dispatch(createCotizacion.rejected(new Error('No se pudo determinar tu ID de cliente. Por favor, asegúrate de iniciar sesión.').message));
                return;
            }

            const dataToSend = { ...formData };

            // Aseguramos que total_estimado y anticipo_requerido se envíen
            if (!dataToSend.total_estimado) {
                dataToSend.total_estimado = 100.00; // Valor de prueba
            }
            if (!dataToSend.anticipo_requerido) {
                dataToSend.anticipo_requerido = dataToSend.total_estimado * 0.5; // El 50% que tu backend espera
            }

            dispatch(createCotizacion(dataToSend));

        } catch (err) {
            console.error('Error durante el envío (validación local previa al dispatch):', err);
            // Esto es para errores sincrónicos. Los errores de la API se manejan en el thunk.
            dispatch(createCotizacion.rejected(err.message));
        }
    };

    return (
        <div className={styles.cotizacionContainer}>
            <h2 className={styles.title}>Solicitar Cotización</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* El campo cliente_id ya no se renderiza visiblemente */}
                {/* Puedes dejar un input hidden si el backend lo espera en el payload exacto del form,
                    pero como estamos enviando un objeto JSON, basta con que esté en formData */}
                {/* <input type="hidden" name="cliente_id" value={formData.cliente_id} /> */}

                {/* Si no hay user.id_cliente (no logueado o error), mostrar mensaje para login/registro */}
                {!user?.id_cliente && (
                    <div className={styles.formGroup}>
                        <p className={styles.helpText}>
                            Para solicitar una cotización, por favor <Link to="/login" className={styles.loginLink}>inicia sesión</Link> o <Link to="/register" className={styles.registerLink}>regístrate</Link>.
                        </p>
                    </div>
                )}
                
                {/* Los campos del formulario solo se muestran si hay un cliente_id disponible */}
                {user?.id_cliente && (
                    <>
                        {/* Tipo de Producto/Servicio */}
                        <div className={styles.formGroup}>
                            <label htmlFor="tipo_producto" className={styles.label}>Tipo de Producto/Servicio:</label>
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

                        {/* Material Base (si tienes una API para materiales) */}
                        <div className={styles.formGroup}>
                            <label htmlFor="material_base_id" className={styles.label}>Material Preferido (Opcional):</label>
                            <select
                                id="material_base_id"
                                name="material_base_id"
                                value={formData.material_base_id}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Selecciona un material</option>
                                {/* {materials.map(material => (
                                    <option key={material.id_material} value={material.id_material}>
                                        {material.nombre_material}
                                    </option>
                                ))} */}
                                {/* Ejemplo de opciones hardcodeadas si no hay API de materiales aún */}
                                <option value="cuero_genuino">Cuero Genuino</option>
                                <option value="cuero_sintetico">Cuero Sintético</option>
                                <option value="tela_jacquard">Tela Jacquard</option>
                                <option value="tela_velvet">Tela Velvet</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        {/* Color de Tela */}
                        <div className={styles.formGroup}>
                            <label htmlFor="color_tela" className={styles.label}>Color de Tela (Opcional):</label>
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

                        {/* Metros Estimados */}
                        <div className={styles.formGroup}>
                            <label htmlFor="metros_estimados" className={styles.label}>Metros Estimados de Material (Opcional):</label>
                            <input
                                type="number"
                                id="metros_estimados"
                                name="metros_estimados"
                                value={formData.metros_estimados}
                                onChange={handleChange}
                                className={styles.input}
                                min="0"
                                step="0.1"
                                placeholder="Ej: 5.5"
                            />
                        </div>

                        {/* Diseño Personalizado */}
                        <div className={styles.formGroup}>
                            <input
                                type="checkbox"
                                id="diseno_personalizado"
                                name="diseno_personalizado"
                                checked={formData.diseno_personalizado}
                                onChange={handleChange}
                                className={styles.checkbox}
                            />
                            <label htmlFor="diseno_personalizado" className={styles.labelCheckbox}>¿Requiere diseño personalizado?</label>
                        </div>

                        {/* Descripción del Diseño (condicional) */}
                        {formData.diseno_personalizado && (
                            <div className={styles.formGroup}>
                                <label htmlFor="descripcion_diseno" className={styles.label}>Descripción del Diseño Personalizado:</label>
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
                        )}

                        {/* Notas Adicionales */}
                        <div className={styles.formGroup}>
                            <label htmlFor="notas_adicionales" className={styles.label}>Notas Adicionales:</label>
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

                        {/* Fecha Agendada (Opcional - para que el cliente proponga) */}
                        <div className={styles.formGroup}>
                            <label htmlFor="fecha_agendada" className={styles.label}>Fecha Preferida (Opcional):</label>
                            <input
                                type="date"
                                id="fecha_agendada"
                                name="fecha_agendada"
                                value={formData.fecha_agendada}
                                onChange={handleChange}
                                className={styles.input}
                            />
                            <small className={styles.helpText}>Indica una fecha ideal para iniciar el servicio.</small>
                        </div>

                        {/* Mensajes de estado */}
                        {status === 'loading' && <p className={styles.message}>Enviando cotización...</p>}
                        {error && <p className={styles.errorMessage}>Error: {error}</p>}
                        {localSuccessMessage && <p className={styles.successMessage}>{localSuccessMessage}</p>}

                        <button type="submit" className={styles.submitButton} disabled={status === 'loading'}>
                            Enviar Cotización
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default CotizacionForm;