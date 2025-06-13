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

import useClients from '../../../hooks/useClients'; 

const CotizacionesGestionPage = () => {
    const dispatch = useDispatch();

    const cotizaciones = useSelector(selectAllCotizaciones) || [];
    const status = useSelector(selectCotizacionesStatus);
    const error = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser);
    const pagination = useSelector(selectCotizacionesPagination);

    const { clients, loadingClients, clientsError } = useClients(); 
    
    const [clientMap, setClientMap] = useState({});

    // >>> NUEVO ESTADO PARA EL TÉRMINO DE BÚSQUEDA DEBOUNCEADO
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Estado para el término debounced

    const [filterStatus, setFilterStatus] = useState('all');
    const [localItemsPerPage, setLocalItemsPerPage] = useState(pagination.limit);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);

    useEffect(() => {
        if (Array.isArray(clients) && clients.length > 0) {
            const map = {};
            clients.forEach(client => {
                map[client.value] = { 
                    nombre: client.label.split(' ')[0] || '', 
                    apellido: client.label.split(' ').slice(1).join(' ') || ''
                };
            });
            setClientMap(map);
        } else if (clientsError) {
            console.error("Error al cargar clientes en useClients:", clientsError);
        }
    }, [clients, clientsError]);

    // >>> NUEVO useEffect para el Debouncing del searchTerm
    useEffect(() => {
        // Establecer un temporizador
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 800); // 500ms de retraso (ajusta este valor si lo consideras necesario)

        // Limpiar el temporizador si el `searchTerm` cambia antes de que se dispare
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); // Se ejecuta cada vez que `searchTerm` cambia

    const loadCotizaciones = useCallback((page = 1, limit = 10, filters = {}) => {
        const queryParams = {
            page,
            limit,
            ...filters,
        };
        if (queryParams.estado === 'all') {
            delete queryParams.estado;
        }

        // >>> CAMBIO CLAVE 2: Usar `debouncedSearchTerm` para la llamada a la API
        if (debouncedSearchTerm) {
            queryParams.searchTerm = debouncedSearchTerm;
        } else {
            delete queryParams.searchTerm;
        }

        dispatch(fetchCotizaciones(queryParams));
    }, [dispatch, debouncedSearchTerm]); // `debouncedSearchTerm` ahora es la dependencia principal para recargar

    // Cargar cotizaciones al montar y cuando cambien filtros, paginación o el TÉRMINO DEBUNCEADO
    useEffect(() => {
        loadCotizaciones(pagination.page, localItemsPerPage, { estado: filterStatus });
    }, [loadCotizaciones, pagination.page, localItemsPerPage, filterStatus]);

    const handlePageChange = (newPage) => {
        loadCotizaciones(newPage, localItemsPerPage, { estado: filterStatus });
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        loadCotizaciones(1, localItemsPerPage, { estado: e.target.value });
    };

    const handleSearchChange = (e) => {
        // >>> CAMBIO CLAVE 3: Solo actualizamos `searchTerm` inmediatamente
        setSearchTerm(e.target.value); 
        // El `useEffect` con `debouncedSearchTerm` se encargará de disparar la búsqueda
        // cuando el usuario deje de escribir.
        // Opcional: Si quieres que la búsqueda se realice solo después de 'x' caracteres,
        // puedes añadir una condición aquí:
        // if (e.target.value.length >= 3 || e.target.value.length === 0) {
        //     setSearchTerm(e.target.value);
        // }
    };

    const handleItemsPerPageChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setLocalItemsPerPage(newLimit);
        loadCotizaciones(1, newLimit, { estado: filterStatus });
    };

    const handleOpenModal = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCotizacion(null);
        loadCotizaciones(pagination.page, localItemsPerPage, { estado: filterStatus });
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

    if (status === 'loading' || loadingClients || Object.keys(clientMap).length === 0) {
        return <div className={styles.loading}>Cargando cotizaciones y clientes...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error al cargar cotizaciones: {error}</div>;
    }

    if (clientsError) {
        return <div className={styles.error}>Error al cargar clientes: {clientsError}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Gestión de Cotizaciones</h1>

            <div className={styles.controls}>
                <div className={styles.searchFilterGroup}>
                    <input
                        type="text"
                        placeholder="Buscar por ID o nombre de cliente" 
                        className={styles.searchInput}
                        value={searchTerm} // El input siempre usa `searchTerm` para la visualización
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
                            cotizaciones.map(cotizacion => {
                                const clientInfo = cotizacion.cliente_id ? clientMap[cotizacion.cliente_id] : null;
                                const clientDisplayName = clientInfo 
                                    ? `${clientInfo.nombre || ''} ${clientInfo.apellido || ''}`.trim() 
                                    : (cotizacion.cliente_id ? `ID: ${cotizacion.cliente_id.substring(0, 8)}... (Desconocido)` : 'Sin cliente');

                                return (
                                    <tr key={cotizacion.id_cotizacion} onClick={() => handleOpenModal(cotizacion)} className={styles.tableRow}>
                                        <td>{cotizacion.id_cotizacion.substring(0, 8)}...</td>
                                        <td>{clientDisplayName}</td>
                                        <td>{cotizacion.tipo_producto}</td>
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
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className={styles.noResults}>No se encontraron cotizaciones.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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