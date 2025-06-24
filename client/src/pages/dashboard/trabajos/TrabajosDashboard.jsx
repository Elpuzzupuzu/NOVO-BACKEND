import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTasks,          // Ícono para proyectos/tareas (activos)
    faCheckCircle,    // Nuevo ícono para proyectos completados
    faSpinner,        // Ícono de carga
    faExclamationCircle // Ícono de error
} from '@fortawesome/free-solid-svg-icons';
import styles from './TrabajosDashboard.module.css'; // Nuevos estilos para este componente

// Importamos los thunks y selectores del slice de trabajos
import {
    fetchTotalTrabajosActivos,
    selectTotalTrabajosActivos,
    fetchTotalTrabajosCompletados, // Nuevo thunk
    selectTotalTrabajosCompletados, // Nuevo selector
    selectTrabajosDashboardStatus,
    selectTrabajosDashboardError,
} from '../../../features/trabajos/trabajosSlice'; // Ajusta la ruta si es necesario

const TrabajosDashboard = () => {
    const dispatch = useDispatch();

    // Seleccionamos los datos y el estado de Redux para trabajos
    const totalTrabajosActivos = useSelector(selectTotalTrabajosActivos);
    const totalTrabajosCompletados = useSelector(selectTotalTrabajosCompletados); // Nuevo
    const trabajosDashboardStatus = useSelector(selectTrabajosDashboardStatus);
    const trabajosDashboardError = useSelector(selectTrabajosDashboardError);

    // Efecto para cargar los datos del dashboard cuando el componente se monta
    useEffect(() => {
        // La condición ajustada para evitar la doble llamada en React.StrictMode
        // Solo despacha las acciones si el estado es 'idle'
        if (trabajosDashboardStatus === 'idle') {
            console.log("Dispatching fetchTotalTrabajosActivos and fetchTotalTrabajosCompletados"); // Para depuración
            dispatch(fetchTotalTrabajosActivos());
            dispatch(fetchTotalTrabajosCompletados()); // Despacha el nuevo thunk
        }
    }, [trabajosDashboardStatus, dispatch]); // Dependencias: estado del dashboard de trabajos y dispatch

    // Objeto para la tarjeta de "Proyectos Activos"
    const proyectosActivosStat = {
        id: 'trabajos-activos',
        title: 'Proyectos Activos',
        value: totalTrabajosActivos,
        icon: faTasks,
        trend: '2 nuevos' // Esto aún es estático, podrías hacerlo dinámico con otra llamada al backend
    };

    // Objeto para la tarjeta de "Proyectos Completados" (NUEVO)
    const proyectosCompletadosStat = {
        id: 'trabajos-completados',
        title: 'Proyectos Completados',
        value: totalTrabajosCompletados,
        icon: faCheckCircle, // Usamos un ícono de check
        trend: '+10% este mes' // Esto es un placeholder, podrías hacerlo dinámico
    };

    return (
        <>
            {/* Sección de Estadísticas Clave - Tarjeta de Proyectos Activos */}
            <section className={styles.statsSection}>
                <h2>Estadísticas de Trabajos</h2>
                {trabajosDashboardStatus === 'loading' && (
                    <div className={styles.loadingMessage}>
                        <FontAwesomeIcon icon={faSpinner} spin /> Cargando estadísticas de trabajos...
                    </div>
                )}
                {trabajosDashboardError && (
                    <div className={styles.errorMessage}>
                        <FontAwesomeIcon icon={faExclamationCircle} /> Error: {trabajosDashboardError}
                    </div>
                )}
                <div className={styles.statsGrid}>
                    {/* Tarjeta de Proyectos Activos */}
                    <div key={proyectosActivosStat.id} className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <FontAwesomeIcon icon={proyectosActivosStat.icon} />
                        </div>
                        <div className={styles.statContent}>
                            <h3>{proyectosActivosStat.title}</h3>
                            <p className={styles.statValue}>
                                {trabajosDashboardStatus === 'succeeded' ? proyectosActivosStat.value.toLocaleString() : '---'}
                            </p>
                            <span className={styles.statTrend}>{proyectosActivosStat.trend}</span>
                        </div>
                    </div>

                    {/* Tarjeta de Proyectos Completados (NUEVA) */}
                    <div key={proyectosCompletadosStat.id} className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <FontAwesomeIcon icon={proyectosCompletadosStat.icon} />
                        </div>
                        <div className={styles.statContent}>
                            <h3>{proyectosCompletadosStat.title}</h3>
                            <p className={styles.statValue}>
                                {trabajosDashboardStatus === 'succeeded' ? proyectosCompletadosStat.value.toLocaleString() : '---'}
                            </p>
                            <span className={styles.statTrend}>{proyectosCompletadosStat.trend}</span>
                        </div>
                    </div>
                    {/* Aquí irían otras tarjetas de estadísticas relacionadas con trabajos si las tuvieras */}
                </div>
            </section>
        </>
    );
};

export default TrabajosDashboard;
