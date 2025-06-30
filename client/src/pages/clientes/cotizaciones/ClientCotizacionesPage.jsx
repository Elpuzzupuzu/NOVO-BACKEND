import React, { useState, useEffect, useCallback, useRef } from 'react'; // Importar useRef
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchClientCotizaciones,
    selectClientCotizaciones,
    selectClientCotizacionesStatus,
    selectClientCotizacionesError,
    selectClientCotizacionesPagination,
} from '../../../features/cotizaciones/cotizacionesSlice';
import { selectUser } from '../../../features/auth/authSlice';
import CotizacionDetailModal from '../../Admin/Cotizaciones/CotizacionDetailModal';
import styles from './ClientCotizaciones.module.css';
import Footer from '../../../components/Footer/Footer';
import SearchInput from '../../../components/SearchInput/SearchInput';
import ClientCotizacionDetailModal from './ClientCotizacionDetailModal';

const ClientCotizacionesPage = () => {
    const dispatch = useDispatch();

    const cotizaciones = useSelector(selectClientCotizaciones) || [];
    const status = useSelector(selectClientCotizacionesStatus);
    const error = useSelector(selectClientCotizacionesError);
    const pagination = useSelector(selectClientCotizacionesPagination);
    const user = useSelector(selectUser);

    // Estados locales para los filtros y paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Estado local para el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);

    // AGREGADO: useRef para controlar la carga inicial
    const isInitialMount = useRef(true);

    const loadMyCotizaciones = useCallback(() => {
        const queryParams = {
            page: currentPage,
            limit: itemsPerPage,
            estado: filterStatus,
        };

        if (queryParams.estado === 'all') {
            delete queryParams.estado;
        }

        if (currentSearchTerm) {
            queryParams.searchTerm = currentSearchTerm;
        } else {
            delete queryParams.searchTerm;
        }

        console.log('loadMyCotizaciones - Dispatching fetchClientCotizaciones with:', queryParams);
        dispatch(fetchClientCotizaciones(queryParams));
    }, [dispatch, currentPage, itemsPerPage, filterStatus, currentSearchTerm]);

    useEffect(() => {
        console.log('useEffect - Triggered. CurrentPage:', currentPage, 'User role:', user?.role, 'SearchTerm:', currentSearchTerm, 'FilterStatus:', filterStatus, 'ItemsPerPage:', itemsPerPage);
        if (user && user.role === 'cliente') {
            // Este useEffect se encargará de disparar la carga inicial y recargas por cambios en dependencias
            loadMyCotizaciones();
        }
        // Marcar que la carga inicial ha terminado después del primer render y ejecución de useEffect
        // Esto es importante para que isInitialMount.current sea false en subsiguientes renders
        isInitialMount.current = false; 
    }, [loadMyCotizaciones, user]);

    // Manejadores de eventos
    const handlePageChange = (newPage) => {
        console.log('handlePageChange - Setting currentPage to:', newPage);
        setCurrentPage(newPage);
    };

    const handleFilterChange = (e) => {
        console.log('handleFilterChange - Setting filterStatus to:', e.target.value, 'and resetting currentPage to 1');
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleSearch = useCallback((term) => {
        // AGREGADO: Lógica para solo resetear la página si el término de búsqueda realmente cambia
        // o si es la primera carga y el término es vacío (para evitar un reset redundante)
        if (term !== currentSearchTerm) {
            console.log('handleSearch - Search term changed. Setting currentSearchTerm to:', term, 'and resetting currentPage to 1');
            setCurrentSearchTerm(term);
            setCurrentPage(1); // Resetear a 1 es correcto solo si la búsqueda CAMBIA
        } else if (isInitialMount.current && term === '') {
            // Esto maneja la primera vez que SearchInput manda '' y currentPage ya es 1.
            // Evita un setCurrentPage(1) innecesario.
            console.log('handleSearch - Initial mount with empty term. No page reset needed as currentPage is already 1.');
            // No hacemos nada, currentPage ya está en 1.
        } else {
            console.log('handleSearch - Term is the same, no page reset needed.');
        }
        // isInitialMount.current se setea a false en el useEffect principal,
        // no es necesario setearlo aquí de nuevo para cada llamada de handleSearch.
    }, [currentSearchTerm]); // Dependencia: currentSearchTerm para comparar con el nuevo 'term'

    const handleItemsPerPageChange = (e) => {
        const newLimit = parseInt(e.target.value);
        console.log('handleItemsPerPageChange - Setting itemsPerPage to:', newLimit, 'and resetting currentPage to 1');
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    const handleOpenModal = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCotizacion(null);
        console.log('handleCloseModal - Modal closed, reloading cotizaciones.');
        loadMyCotizaciones(); // Recarga las cotizaciones para reflejar cualquier posible cambio después de cerrar el modal
    };

    const canView = user?.role === 'cliente';

    if (!canView) {
        return (
            <div className={styles.permissionDenied}>
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para ver tus cotizaciones.</p>
            </div>
        );
    }

    if (status === 'loading') {
        return <div className={styles.loading}>Cargando tus cotizaciones...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error al cargar tus cotizaciones: {error}</div>;
    }

    const clientFullName = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Cliente';

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Mis Cotizaciones ({clientFullName})</h1>

            <div className={styles.controls}>
                <div className={styles.searchFilterGroup}>
                    <SearchInput
                        initialSearchTerm={currentSearchTerm}
                        onSearch={handleSearch}
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
                        value={itemsPerPage}
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={styles.noResults}>No se encontraron cotizaciones para ti.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)} // Usar pagination.page
                        disabled={!pagination.hasPrevPage}
                        className={styles.paginationButton}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`${styles.paginationButton} ${pagination.page === i + 1 ? styles.activePage : ''}`} // Usar pagination.page
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)} // Usar pagination.page
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
                <ClientCotizacionDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    cotizacion={selectedCotizacion}
                />
            )}
            <Footer />
        </div>
    );
};

export default ClientCotizacionesPage;