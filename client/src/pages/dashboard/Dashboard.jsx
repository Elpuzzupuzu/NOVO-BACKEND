import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons'; // Eliminado faTasks de aquí

import styles from './Dashboard.module.css'; // Estilos principales del dashboard

// Importamos los componentes de las secciones específicas
import CotizacionesDashboard from '../dashboard/cotizaciones/CotizacionesDashBoard'; // Ajusta la ruta si es necesario
import TrabajosDashboard from '../dashboard/trabajos/TrabajosDashboard'; // Importa el nuevo componente de Trabajos

const Dashboard = () => {
    // Las estadísticas de cotizaciones y trabajos se manejan en sus propios componentes.
    // Solo dejamos aquí otras estadísticas o componentes que no tengan una sección dedicada aún.
    const otherStats = [
        // La tarjeta de Proyectos Activos ahora se maneja en TrabajosDashboard
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

            {/* Contenedor flexible para las secciones del dashboard */}
            <div className={styles.dashboardSectionsGrid}>
                {/* Renderiza el componente de Cotizaciones del Dashboard */}
                <CotizacionesDashboard />

                {/* Renderiza el componente de Trabajos del Dashboard */}
                <TrabajosDashboard />

                {/* Sección de Estadísticas Rápidas (Resto de Tarjetas, temporalmente aquí) */}
                {/* Puedes mover esto a su propio componente 'ClientesDashboard' más adelante */}
                <section className={styles.statsSection}>
                    <h2>Estadísticas de Clientes</h2>
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
            </div>

            {/* Sección de Actividad Reciente (temporalmente aquí) */}
            {/* Esto podría ser un componente ActividadRecienteDashboard que consolide datos de varios slices */}
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
        </div>
    );
};

export default Dashboard;
