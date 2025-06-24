import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileInvoiceDollar,
    faSpinner,
    faExclamationCircle,
    faChartBar, // Nuevo ícono para gráficos, o puedes usar faChartLine
} from '@fortawesome/free-solid-svg-icons';
import styles from './CotizacionesDashboard.module.css'; // Nuevos estilos para este componente

// Importamos los thunks y selectores del slice de cotizaciones
import {
    fetchTotalCotizaciones,
    selectTotalCotizaciones,
    fetchIngresosEstimadosPorMes,
    selectIngresosEstimadosPorMes,
    selectDashboardStatus, // Este estado es global para el dashboard, pero se maneja en el slice de cotizaciones por ahora
    selectDashboardError,
} from '../../../features/cotizaciones/cotizacionesSlice'; // Ajusta la ruta si es necesario

const CotizacionesDashboard = () => {
    const dispatch = useDispatch();

    // Seleccionamos los datos y el estado de Redux para cotizaciones
    const totalCotizaciones = useSelector(selectTotalCotizaciones);
    const ingresosEstimadosPorMes = useSelector(selectIngresosEstimadosPorMes);
    const dashboardStatus = useSelector(selectDashboardStatus); // Usamos el estado global del dashboard
    const dashboardError = useSelector(selectDashboardError);

    // Efecto para cargar los datos del dashboard cuando el componente se monta
    useEffect(() => {
        // Solo cargar si el estado es 'idle' o si se necesita recargar (ej. después de un error)
        if (dashboardStatus === 'idle' || (dashboardStatus === 'failed' && !dashboardError)) { // Intentar recargar si falló sin error específico
            // Cargar el total de cotizaciones
            dispatch(fetchTotalCotizaciones());

            // Cargar los ingresos estimados por mes para el año actual
            const currentYear = new Date().getFullYear();
            // Define qué estados de cotización representan 'ingresos' para tu negocio
            const incomeStates = ['Anticipo Pagado - Agendado', 'Anticipo Pagado - En Cola', 'Completada'];
            dispatch(fetchIngresosEstimadosPorMes({ year: currentYear, estados: incomeStates }));
        }
    }, [dashboardStatus, dashboardError, dispatch]); // Dependencias: estado del dashboard y dispatch

    // Helper para formatear el nombre del mes
    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1); // Los meses en JS son de 0-11
        return date.toLocaleString('es-ES', { month: 'long' });
    };

    // Objeto para la primera tarjeta de estadísticas (ahora dinámica)
    const totalCotizacionesStat = {
        id: 'cot-total',
        title: 'Cotizaciones Totales',
        value: totalCotizaciones,
        icon: faFileInvoiceDollar,
        trend: '+15% este mes' // Esto aún es estático, podrías hacerlo dinámico con otra llamada al backend
    };

    return (
        <>
            {/* Sección de Estadísticas Clave - Tarjeta de Cotizaciones */}
            <section className={styles.statsSection}>
                <h2>Estadísticas de Cotizaciones</h2>
                {dashboardStatus === 'loading' && (
                    <div className={styles.loadingMessage}>
                        <FontAwesomeIcon icon={faSpinner} spin /> Cargando estadísticas de cotizaciones...
                    </div>
                )}
                {dashboardError && (
                    <div className={styles.errorMessage}>
                        <FontAwesomeIcon icon={faExclamationCircle} /> Error: {dashboardError}
                    </div>
                )}
                <div className={styles.statsGrid}>
                    <div key={totalCotizacionesStat.id} className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <FontAwesomeIcon icon={totalCotizacionesStat.icon} />
                        </div>
                        <div className={styles.statContent}>
                            <h3>{totalCotizacionesStat.title}</h3>
                            <p className={styles.statValue}>
                                {dashboardStatus === 'succeeded' ? totalCotizacionesStat.value.toLocaleString() : '---'}
                            </p>
                            <span className={styles.statTrend}>{totalCotizacionesStat.trend}</span>
                        </div>
                    </div>
                    {/* Otras tarjetas de estadísticas irían en componentes separados */}
                </div>
            </section>

            {/* Sección de Gráficos (Ingresos Estimados por Mes) */}
            <section className={styles.chartsSection}>
                <h2>Ingresos Estimados por Mes ({new Date().getFullYear()})</h2>
                {dashboardStatus === 'succeeded' && ingresosEstimadosPorMes.length > 0 ? (
                    <div className={styles.monthlyIncomeList}>
                        {ingresosEstimadosPorMes.map(item => (
                            <div key={item.month} className={styles.monthlyIncomeItem}>
                                <span className={styles.monthName}>{getMonthName(item.month)}:</span>
                                <span className={styles.incomeAmount}>
                                    ${item.totalAmount ? item.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.chartPlaceholder}>
                        <FontAwesomeIcon icon={faChartBar} className={styles.chartIcon} />
                        <p>
                            {dashboardStatus === 'loading' && "Cargando datos de ingresos..."}
                            {dashboardStatus === 'succeeded' && ingresosEstimadosPorMes.length === 0 && "No hay datos de ingresos para este año."}
                            {dashboardStatus === 'failed' && "No se pudieron cargar los datos de ingresos."}
                            {dashboardStatus === 'idle' && "Esperando cargar datos de ingresos..."}
                        </p>
                    </div>
                )}
            </section>
        </>
    );
};

export default CotizacionesDashboard;
