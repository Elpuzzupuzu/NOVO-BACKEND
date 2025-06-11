import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCotizaciones,
    selectAllCotizaciones,
    selectCotizacionesStatus,
    selectCotizacionesError,
    // updateCotizacion, // Podríamos usarlo directamente aquí o en el modal
} from '../../../features/cotizaciones/cotizacionesSlice';
import { selectUser } from '../../../features/auth/authSlice';
import CotizacionDetailModal from './CotizacionDetailModal'; // Importa el modal que crearemos
import styles from './CotizacionesGestionPage.module.css';

const CotizacionesGestionPage = () => {
    const dispatch = useDispatch();
    // Añadimos un valor predeterminado de array vacío para `cotizaciones` en caso de que sea undefined
    const cotizaciones = useSelector(selectAllCotizaciones) || []; 
    const status = useSelector(selectCotizacionesStatus);
    const error = useSelector(selectCotizacionesError);
    const user = useSelector(selectUser);

    // Estados para la búsqueda y filtrado
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pendiente', 'aprobada', etc.

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Puedes ajustar esto

    // Estado para el modal de detalle
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);

    // Cargar cotizaciones al montar el componente
    useEffect(() => {
        // Solo cargar si el estado es 'idle' para evitar múltiples cargas
        if (status === 'idle') {
            dispatch(fetchCotizaciones());
        }
    }, [status, dispatch]); // Dependencia: solo se ejecuta si 'status' cambia a 'idle' o al montar por primera vez

    // ************* DEBUGGING: LOGGING THE VALUE OF COTIZACIONES *************
    // Este console.log te mostrará el valor de `cotizaciones` justo antes de que se intente filtrar.
    // Revisa la consola de tu navegador cuando cargues esta página para ver qué valor tiene.
    console.log('Value of cotizaciones in CotizacionesGestionPage:', cotizaciones);
    // ************************************************************************


    // Filtrar cotizaciones basado en búsqueda y estado
    const filteredCotizaciones = cotizaciones.filter(cotizacion => {
        const matchesSearchTerm = cotizacion.tipo_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  cotizacion.descripcion_diseno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  cotizacion.notas_adicionales?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  cotizacion.cliente_id.toLowerCase().includes(searchTerm.toLowerCase()); // Búsqueda por ID de cliente

        const matchesFilterStatus = filterStatus === 'all' || cotizacion.estado === filterStatus;

        return matchesSearchTerm && matchesFilterStatus;
    });

    // Paginación de las cotizaciones filtradas
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCotizaciones.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCotizaciones.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOpenModal = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCotizacion(null);
        // Opcional: Refrescar la lista de cotizaciones si se hicieron cambios en el modal
        dispatch(fetchCotizaciones()); // Volver a cargar para reflejar posibles cambios
    };

    // Permisos de usuario para ver esta página (asegúrate de que el user.role exista y sea correcto)
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
                        placeholder="Buscar por tipo de producto, cliente ID, etc."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Resetear a la primera página al buscar
                        }}
                    />
                    <select
                        className={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1); // Resetear a la primera página al filtrar
                        }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente ID</th>
                            <th>Tipo de Producto</th>
                            <th>Material</th>
                            <th>Fecha Agendada</th>
                            <th>Estado</th>
                            <th>Total Estimado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map(cotizacion => (
                                <tr key={cotizacion.id_cotizacion} onClick={() => handleOpenModal(cotizacion)} className={styles.tableRow}>
                                    <td>{cotizacion.id_cotizacion.substring(0, 8)}...</td>
                                    <td>{cotizacion.cliente_id.substring(0, 8)}...</td>
                                    <td>{cotizacion.tipo_producto}</td>
                                    <td>{cotizacion.material_base_id || 'N/A'}</td>
                                    <td>{cotizacion.fecha_agendada ? new Date(cotizacion.fecha_agendada).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[cotizacion.estado.toLowerCase().replace(/ /g, '_')]}`}>
                                            {cotizacion.estado.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    {/* FIX: Asegura que total_estimado es un número antes de llamar a toFixed */}
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
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        Siguiente
                    </button>
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
