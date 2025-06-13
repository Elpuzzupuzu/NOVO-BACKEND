import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCotizaciones,
    selectAllCotizaciones,
    selectCotizacionesStatus,
    selectCotizacionesError,
    selectCotizacionesPagination,
} from '../../../features/cotizaciones/cotizacionesSlice';
import { selectUser } from '../../../features/auth/authSlice';
import CotizacionDetailModal from './CotizacionDetailModal';
import styles from './CotizacionesGestionPage.module.css';

const CotizacionesGestionPage = () => {
    const dispatch = useDispatch();

    const cotizaciones = useSelector(selectAllCotizaciones) || [];
    const status = useSelector(selectCotizacionesStatus);
    const error = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser);
    const pagination = useSelector(selectCotizacionesPagination);

    // Estados para la búsqueda y filtrado
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Estado para el número de registros por página
    const [localItemsPerPage, setLocalItemsPerPage] = useState(pagination.limit); // Usa el límite inicial del Redux store

    // Estados para el modal de detalle
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);

    // Función para despachar la carga de cotizaciones con filtros y paginación
    const loadCotizaciones = useCallback((page = 1, limit = 10, filters = {}) => {
        const queryParams = {
            page,
            limit,
            ...filters,
        };
        if (queryParams.estado === 'all') {
            delete queryParams.estado;
        }
        if (searchTerm) {
            // Si el searchTerm es para buscar por cliente_id, asegúrate que el backend lo reciba como tal.
            // Si la búsqueda se va a hacer por nombre/apellido del cliente, aquí deberías enviar un filtro diferente
            // por ejemplo, `queryParams.search_client_name = searchTerm;` y manejarlo en el backend.
            // Por ahora, lo mantenemos como cliente_id para compatibilidad con el backend actual.
            queryParams.cliente_id = searchTerm;
        }
        dispatch(fetchCotizaciones(queryParams));
    }, [dispatch, searchTerm]); // `searchTerm` como dependencia

    // Cargar cotizaciones al montar el componente y cuando cambien los filtros o la paginación
    useEffect(() => {
        // Usa `localItemsPerPage` como el límite cuando se despacha la acción
        loadCotizaciones(pagination.page, localItemsPerPage, { estado: filterStatus });
    }, [loadCotizaciones, pagination.page, localItemsPerPage, filterStatus]); // `localItemsPerPage` como dependencia

    const handlePageChange = (newPage) => {
        loadCotizaciones(newPage, localItemsPerPage, { estado: filterStatus });
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        // Siempre vuelve a la página 1 cuando se aplica un nuevo filtro
        loadCotizaciones(1, localItemsPerPage, { estado: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Siempre vuelve a la página 1 cuando se aplica una nueva búsqueda
        loadCotizaciones(1, localItemsPerPage, { estado: filterStatus, cliente_id: e.target.value });
    };

    // Manejador para el cambio de items por página
    const handleItemsPerPageChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setLocalItemsPerPage(newLimit);
        // Al cambiar el número de elementos por página, volvemos a la primera página
        loadCotizaciones(1, newLimit, { estado: filterStatus, cliente_id: searchTerm });
    };

    const handleOpenModal = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCotizacion(null);
        // Después de cerrar el modal, recargar la lista con los filtros y paginación actuales
        loadCotizaciones(pagination.page, localItemsPerPage, { estado: filterStatus, cliente_id: searchTerm });
    };

    const canView = user?.role === 'admin' || user?.role === 'empleado' || user?.role === 'gerente';

    if (!canView) {
        return (
            <div className={styles.permissionDenied}>
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para ver la gestión de cotizaciones.</p>
            </div>
        );
    }

    if (status === 'loading' && cotizaciones.length === 0) {
        return <div className={styles.loading}>Cargando cotizaciones...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error al cargar cotizaciones: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Gestión de Cotizaciones</h1>

            <div className={styles.controls}>
                <div className={styles.searchFilterGroup}>
                    <input
                        type="text"
                        placeholder="Buscar por ID de cliente"
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <select
                        className={styles.filterSelect}
                        value={filterStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="Pendiente de Anticipo">Pendiente de Anticipo</option>
                        <option value="Anticipo Pagado - Agendado">Anticipo Pagado - Agendado</option>
                        <option value="Anticipo Pagado - En Cola">Anticipo Pagado - En Cola</option>
                        <option value="Rechazada">Rechazada</option>
                        <option value="Completada">Completada</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>

                    {/* Select para Registros por Página */}
                    <select
                        className={styles.filterSelect}
                        value={localItemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        <option value={5}>5 por página</option>
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                        <option value={50}>50 por página</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID Cotización</th> 
                            <th>Cliente</th>      
                            <th>Tipo de Producto</th>
                            <th>Material</th>      
                            <th>Fecha Agendada</th>
                            <th>Estado</th>
                            <th>Total Estimado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotizaciones.length > 0 ? (
                            cotizaciones.map(cotizacion => (
                                <tr key={cotizacion.id_cotizacion} onClick={() => handleOpenModal(cotizacion)} className={styles.tableRow}>
                                    <td>{cotizacion.id_cotizacion.substring(0, 8)}...</td>
                                    {/* Muestra el nombre y apellido del cliente */}
                                    <td>{`${cotizacion.cliente_nombre || ''} ${cotizacion.cliente_apellido || ''}`.trim()}</td>
                                    <td>{cotizacion.tipo_producto}</td>
                                    {/* Muestra el nombre del material */}
                                    <td>{cotizacion.material_nombre || 'N/A'}</td>
                                    <td>{cotizacion.fecha_agendada ? new Date(cotizacion.fecha_agendada).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[cotizacion.estado.toLowerCase().replace(/ /g, '_')]}`}>
                                            {cotizacion.estado.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td>${parseFloat(cotizacion.total_estimado)?.toFixed(2) || '0.00'}</td>
                                    <td>
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal(cotizacion); }} className={styles.actionButton}>
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className={styles.noResults}>No se encontraron cotizaciones.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className={styles.paginationButton}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`${styles.paginationButton} ${pagination.page === i + 1 ? styles.activePage : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className={styles.paginationButton}
                    >
                        Siguiente
                    </button>
                    <span className={styles.pageInfo}>
                        Página {pagination.page} de {pagination.totalPages} (Total: {pagination.total})
                    </span>
                </div>
            )}

            {/* Modal de Detalle */}
            {selectedCotizacion && (
                <CotizacionDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    cotizacion={selectedCotizacion}
                />
            )}
        </div>
    );
};

export default CotizacionesGestionPage;