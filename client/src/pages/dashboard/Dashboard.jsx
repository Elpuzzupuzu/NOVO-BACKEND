import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faTasks, faUsers } from '@fortawesome/free-solid-svg-icons';
import styles from './Dashboard.module.css'; // Estilos principales del dashboard

// Importamos los componentes de las secciones específicas
import CotizacionesDashboard from '../dashboard/cotizaciones/CotizacionesDashBoard';

const Dashboard = () => {
    // Datos estáticos temporales para otras secciones, que eventualmente serán sus propios componentes
    const otherStats = [
        // Las cotizaciones ahora se manejan en CotizacionesDashboard
        { id: 2, title: 'Proyectos Activos', value: '85', icon: faTasks, trend: '2 nuevos' },
        { id: 3, title: 'Nuevos Clientes (Últimos 30 días)', value: '32', icon: faUsers, trend: '+8% respecto al mes pasado' },
    ];

    const recentActivities = [
        { id: 'ACT001', type: 'Cotización Creada', description: 'Nueva cotización para John Doe (Diseño Personalizado)', date: '21/06/2025' },
        { id: 'ACT002', type: 'Cliente Registrado', description: 'Nuevo cliente: Jane Smith', date: '20/06/2025' },
        { id: 'ACT003', type: 'Proyecto Actualizado', description: 'Proyecto "Restauración de Interiores" actualizado a "Completado"', date: '19/06/2025' },
        { id: 'ACT004', type: 'Cotización Actualizada', description: 'Cotización para Alice Johnson a "Pendiente de Anticipo"', date: '18/06/2025' },
        { id: 'ACT005', type: 'Material Añadido', description: 'Nuevo material: "Vinil Adhesivo Reforzado"', date: '17/06/2025' },
    ];

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <h1><FontAwesomeIcon icon={faChartLine} className={styles.headerIcon} /> Resumen del Dashboard</h1>
                <p>Bienvenido al panel de administración de NOVO. Aquí puedes ver un resumen rápido de la actividad de tu negocio.</p>
            </header>

            {/* Renderiza el componente de Cotizaciones del Dashboard */}
            <CotizacionesDashboard />

            {/* Sección de Estadísticas Rápidas (Resto de Tarjetas, temporalmente aquí) */}
            <section className={styles.statsSection}>
                <h2>Otras Estadísticas Clave</h2>
                <div className={styles.statsGrid}>
                    {otherStats.map(stat => (
                        <div key={stat.id} className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <FontAwesomeIcon icon={stat.icon} />
                            </div>
                            <div className={styles.statContent}>
                                <h3>{stat.title}</h3>
                                <p className={styles.statValue}>{stat.value}</p>
                                <span className={styles.statTrend}>{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sección de Actividad Reciente (temporalmente aquí) */}
            <section className={styles.recentActivitySection}>
                <h2>Actividad Reciente</h2>
                <div className={styles.activityList}>
                    {recentActivities.map(activity => (
                        <div key={activity.id} className={styles.activityItem}>
                            <div className={styles.activityHeader}>
                                <span className={styles.activityType}>{activity.type}</span>
                                <span className={styles.activityDate}>{activity.date}</span>
                            </div>
                            <p className={styles.activityDescription}>{activity.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* La sección de gráficos de cotizaciones se ha movido a CotizacionesDashboard */}
            {/* Si hubiera otros gráficos de otras entidades, irían aquí en sus propios componentes */}
        </div>
    );
};

export default Dashboard;
