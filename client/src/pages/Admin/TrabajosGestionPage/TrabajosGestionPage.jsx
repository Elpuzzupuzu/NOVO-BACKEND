// client/src/pages/TrabajosGestionPage/TrabajosGestionPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchTrabajos,
    createTrabajo,
    updateTrabajo,
    deleteTrabajo,
    setSelectedTrabajo,
    clearSelectedTrabajo
} from '../../../features/trabajos/trabajosSlice';
// Importa TrabajoDetailModal directamente desde su ubicación si no está en la misma carpeta
// Asegúrate que la ruta sea correcta, si TrabajoDetailModal está en el mismo nivel
// que TrabajosGestionPage, entonces sería: import TrabajoDetailModal from './TrabajoDetailModal';
// Si está en el directorio components, como se suele hacer, sería:
import TrabajoDetailModal from './TrabajoDetailModal/TrabajoDetailModal.jsx'; // ASUMO esta ruta
import SearchInput from '../../../components/SearchInput/SearchInput';
import styles from './TrabajosGestionPage.module.css';

// Importa AMBOS hooks
import useEmpleados from '../../../hooks/useEmpleados';
import useCotizaciones from '../../../hooks/useCotizaciones'; // <--- ¡NUEVO!

const defaultPaginationState = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
};

const TrabajoGestionPage = () => {
    const dispatch = useDispatch();
    const {
        data: trabajos = [],
        pagination = defaultPaginationState,
        status,
        error,
        selectedTrabajo
    } = useSelector((state) => {
        console.log("Estado actual del slice 'trabajos':", state.trabajos);
        return state.trabajos;
    });

    const [currentPage, setCurrentPage] = useState(pagination?.page || 1);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');

    // ===========================================
    // ¡AQUÍ ES DONDE USAMOS AMBOS HOOKS!
    // ===========================================
    const { empleados, isLoadingEmpleados, errorEmpleados } = useEmpleados();
    const { cotizaciones, isLoadingCotizaciones, errorCotizaciones } = useCotizaciones(); // <--- ¡USANDO EL HOOK!

    // El estado de carga y error ahora depende de AMBOS lookups
    const isLoadingLookups = isLoadingEmpleados || isLoadingCotizaciones;
    const lookupError = errorEmpleados || errorCotizaciones; // Prioriza un error si hay varios

    const estadoOptions = [
        { value: '', label: 'Todos los Estados' },
        { value: 'Pendiente', label: 'Pendiente' },
        { value: 'En Proceso', label: 'En Proceso' },
        { value: 'En Medición', label: 'En Medición' },
        { value: 'Listo para Entrega', label: 'Listo para Entrega' },
        { value: 'Entregado', label: 'Entregado' },
        { value: 'Cancelado', label: 'Cancelado' },
        { value: 'Completada', label: 'Completada' }
    ];

    const loadTrabajos = useCallback(() => {
        const limitToUse = pagination?.limit || 10;

        console.log("Cargando trabajos con parámetros:", {
            page: currentPage,
            limit: limitToUse,
            searchTerm: searchTerm,
            estado: estadoFilter,
        });

        dispatch(fetchTrabajos({
            page: currentPage,
            limit: limitToUse,
            searchTerm: searchTerm,
            estado: estadoFilter,
        }));
    }, [dispatch, currentPage, pagination?.limit, searchTerm, estadoFilter]);

    useEffect(() => {
        console.log("Componente TrabajoGestionPage renderizado.");
        console.log("Status:", status);
        console.log("Error:", error);
        console.log("Trabajos (data):", trabajos);
        console.log("Paginación:", pagination);

        loadTrabajos();
    }, [loadTrabajos]);

    const handleSearchChange = useCallback((newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        setCurrentPage(1);
    }, []);

    const handleEstadoFilterChange = (event) => {
        setEstadoFilter(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCreateNew = () => {
        dispatch(clearSelectedTrabajo());
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleViewEdit = (trabajo) => {
        dispatch(setSelectedTrabajo(trabajo));
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        dispatch(clearSelectedTrabajo());
        loadTrabajos();
    };

    const handleSaveTrabajo = async (trabajoData) => {
        try {
            if (modalMode === 'create') {
                await dispatch(createTrabajo(trabajoData)).unwrap();
                alert('¡Creado! El trabajo ha sido creado exitosamente.');
            } else {
                await dispatch(updateTrabajo({ id_trabajo: selectedTrabajo.id_trabajo, updateData: trabajoData })).unwrap();
                alert('¡Actualizado! El trabajo ha sido actualizado exitosamente.');
            }
            handleCloseModal();
        } catch (err) {
            console.error('Error al guardar trabajo:', err);
            // Redux Toolkit unwrap() puede devolver un error con response.data.message
            // o un simple string de error.
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
            alert(`Error: No se pudo guardar el trabajo. Detalles: ${errorMessage}`);
        }
    };

    const handleDeleteTrabajo = async (id_trabajo) => {
        const isConfirmed = window.confirm('¿Estás seguro de que quieres eliminar este trabajo? ¡No podrás revertir esto!');

        if (isConfirmed) {
            try {
                await dispatch(deleteTrabajo(id_trabajo)).unwrap();
                alert('¡Eliminado! El trabajo ha sido eliminado.');
                loadTrabajos();
            } catch (err) {
                console.error('Error al eliminar trabajo:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
                alert(`Error: No se pudo eliminar el trabajo. Detalles: ${errorMessage}`);
            }
        }
    };

    // ===========================================
    // Manejo de estados de carga y error para los Lookups (Cotizaciones y Empleados)
    // Se muestra un mensaje y se evita renderizar la tabla o el modal si los datos no están listos.
    // ===========================================
    if (isLoadingLookups) {
        return <div className={styles.loadingContainer}>Cargando opciones para el formulario...</div>;
    }

    if (lookupError) {
        return <div className={styles.errorContainer}>Error al cargar opciones: {lookupError}</div>;
    }

    // ===========================================
    // Mantenemos los estados de carga y error para los Trabajos (Redux)
    // ===========================================
    if (status === 'loading' && trabajos.length === 0) {
        return <div className={styles.loadingContainer}>Cargando trabajos...</div>;
    }

    if (status === 'failed') {
        return <div className={styles.errorContainer}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Gestión de Trabajos</h1>

            <div className={styles.controls}>
                <SearchInput
                    initialSearchTerm={searchTerm}
                    onSearch={handleSearchChange}
                    className={styles.searchInput}
                />
                <select
                    className={styles.filterSelect}
                    value={estadoFilter}
                    onChange={handleEstadoFilterChange}
                >
                    {estadoOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <button className={styles.addButton} onClick={handleCreateNew}>
                    Crear Nuevo Trabajo
                </button>
            </div>

            {/* Ahora que isLoadingLookups y lookupError se manejan arriba,
                este div se simplifica, ya que las opciones estarán cargadas
                cuando se llegue a este punto del render. */}
            {/* Antes: {isLoadingLookups && <p>Cargando opciones para empleados...</p>} */}
            {/* Antes: {lookupError && <p className={styles.errorText}>Error al cargar opciones: {lookupError}</p>} */}


            {trabajos.length === 0 && status !== 'loading' ? (
                <p className={styles.noResults}>No se encontraron trabajos que coincidan con los criterios de búsqueda.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID Trabajo</th>
                                <th>Cotización ID</th>
                                <th>Cliente</th>
                                <th>Empleado Asignado</th>
                                <th>Estado</th>
                                <th>Inicio Estimado</th>
                                <th>Fin Estimado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trabajos.map((trabajo) => (
                                <tr
                                    key={trabajo.id_trabajo}
                                    onClick={() => handleViewEdit(trabajo)}
                                    className={styles.tableRow}
                                >
                                    <td>{trabajo.id_trabajo ? trabajo.id_trabajo.substring(0, 8) + '...' : 'N/A'}</td>
                                    <td>{trabajo.cotizacion_id ? trabajo.cotizacion_id.substring(0, 8) + '...' : 'N/A'}</td>
                                    <td>{trabajo.cliente_nombre ? `${trabajo.cliente_nombre} ${trabajo.cliente_apellido}` : 'N/A'}</td>
                                    <td>{trabajo.empleado_nombre ? `${trabajo.empleado_nombre} ${trabajo.empleado_apellido}` : 'No Asignado'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[trabajo.estado.replace(/\s/g, '')]}`}>
                                            {trabajo.estado}
                                        </span>
                                    </td>
                                    <td>{trabajo.fecha_inicio_estimada ? new Date(trabajo.fecha_inicio_estimada).toLocaleDateString() : 'N/A'}</td>
                                    <td>{trabajo.fecha_fin_estimada ? new Date(trabajo.fecha_fin_estimada).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={styles.pagination}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage || status === 'loading'}
                    className={styles.paginationButton}
                >
                    Anterior
                </button>
                <span className={styles.pageInfo}>
                    Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage || status === 'loading'}
                    className={styles.paginationButton}
                >
                    Siguiente
                </button>
            </div>

            {isModalOpen && (
                <TrabajoDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    mode={modalMode}
                    initialData={selectedTrabajo}
                    onSave={handleSaveTrabajo}
                    onDelete={handleDeleteTrabajo}
                    // ===========================================
                    // ¡PASANDO AMBAS LISTAS DE OPCIONES COMO PROPS!
                    // ===========================================
                    cotizacionesOptions={cotizaciones} // Pasa las cotizaciones del hook
                    empleadosOptions={empleados}     // Pasa los empleados del hook
                />
            )}
        </div>
    );
};

export default TrabajoGestionPage;