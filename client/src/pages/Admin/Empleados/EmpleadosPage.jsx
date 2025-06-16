import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPaginatedEmpleados,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
    selectAllEmpleados,
    selectEmpleadosStatus,
    selectEmpleadosError,
    selectCurrentEmpleadoPage,
    selectTotalEmpleadoPages,
    selectTotalEmpleados,
    selectEmpleadoLimit,
    selectEmpleadoSearchTerm,
    selectEmpleadoActivoFilter,
    selectEmpleadoRoleFilter,
    setEmpleadoPage,
    setEmpleadoLimit,
    setEmpleadoSearchTerm,
    setEmpleadoActivoFilter,
    setEmpleadoRoleFilter,
    clearEmpleadosError,
    // resetEmpleadosStatus, // No es necesario si se recarga explícitamente
} from '../../../features/empleados/EmpleadosSlice';
import EmpleadoDetailModal from './EmpleadoDetailModal';
import ConfirmationModal from './ConfirmationModal';
import styles from './EmpleadosPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrash, 
    faSpinner, 
    faCheckCircle, 
    faExclamationTriangle, 
    faInfoCircle, 
    faChevronLeft, 
    faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import Footer from '../../../components/Footer/Footer';

const EmpleadosPage = () => {
    const dispatch = useDispatch();

    // Selectores del estado de Redux
    const empleados = useSelector(selectAllEmpleados);
    const empleadosStatus = useSelector(selectEmpleadosStatus);
    const empleadosError = useSelector(selectEmpleadosError);
    const currentPage = useSelector(selectCurrentEmpleadoPage);
    const totalPages = useSelector(selectTotalEmpleadoPages);
    const totalItems = useSelector(selectTotalEmpleados);
    const limit = useSelector(selectEmpleadoLimit);
    const storedSearchTerm = useSelector(selectEmpleadoSearchTerm);
    const storedActivoFilter = useSelector(selectEmpleadoActivoFilter);
    const storedRoleFilter = useSelector(selectEmpleadoRoleFilter);

    // Estados locales para la UI y la lógica de debounce
    const [isEmpleadoModalOpen, setIsEmpleadoModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [empleadoToDeleteId, setEmpleadoToDeleteId] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // Estado local para el input de búsqueda (controlado por el usuario)
    const [searchInput, setSearchInput] = useState(storedSearchTerm);
    
    // Estado local para los filtros de la UI, inicializados desde Redux
    // Convertir a string para los select HTML si el valor de Redux no es string
    const [activoFilterUI, setActivoFilterUI] = useState(
        storedActivoFilter === true ? 'true' : storedActivoFilter === false ? 'false' : ''
    );
    const [roleFilterUI, setRoleFilterUI] = useState(storedRoleFilter);
    
    // Estado para el límite de elementos por página (controlado por el usuario), sincronizado con Redux
    const [itemsPerPageUI, setItemsPerPageUI] = useState(limit); 

    // Sincronizar el estado local de itemsPerPageUI con el límite del store si cambia externamente
    useEffect(() => {
        setItemsPerPageUI(limit);
    }, [limit]);

    // Sincronizar el estado local de searchInput con el storedSearchTerm si cambia externamente (ej. al resetear filtros)
    useEffect(() => {
        setSearchInput(storedSearchTerm);
    }, [storedSearchTerm]);

    // Sincronizar el estado local de los filtros UI con los del store si cambian externamente
    useEffect(() => {
        setActivoFilterUI(storedActivoFilter === true ? 'true' : storedActivoFilter === false ? 'false' : '');
    }, [storedActivoFilter]);

    useEffect(() => {
        setRoleFilterUI(storedRoleFilter);
    }, [storedRoleFilter]);


    // Efecto para debounce del término de búsqueda (actualiza el store)
    // Este useEffect se activa cada vez que 'searchInput' (el estado del input) cambia.
    // Establece un temporizador para despachar 'setEmpleadoSearchTerm' después de un breve retraso.
    // Si 'searchInput' cambia de nuevo antes de que el temporizador termine, el temporizador anterior se limpia.
    useEffect(() => {
        const handler = setTimeout(() => {
            // Despachar solo si el valor local es diferente del valor ya en el store
            // para evitar despachos redundantes si el debounce se resuelve con el mismo valor
            if (searchInput !== storedSearchTerm) { 
                dispatch(setEmpleadoSearchTerm(searchInput));
                dispatch(setEmpleadoPage(1)); // Resetear a la primera página con la nueva búsqueda
            }
        }, 500); // 500ms de retraso para el debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchInput, dispatch, storedSearchTerm]); // Depende de searchInput y storedSearchTerm


    // Función memoizada para cargar empleados con los parámetros actuales del store
    // Se utilizará para todas las recargas de la tabla (inicial, paginación, filtros, CRUD).
    const loadEmpleados = useCallback(() => {
        const filters = {};
        // Solo añadir el término de búsqueda si no está vacío
        if (storedSearchTerm) {
            filters.searchTerm = storedSearchTerm;
        }
        // Solo añadir el filtro de activo si no está vacío
        if (storedActivoFilter !== '') { 
            filters.activo = storedActivoFilter; // Ya es booleano o '' en el store
        }
        // Solo añadir el filtro de rol si no está vacío
        if (storedRoleFilter) {
            filters.role = storedRoleFilter;
        }

        dispatch(fetchPaginatedEmpleados({
            ...filters,
            page: currentPage,
            limit: limit
        }));
    }, [dispatch, storedSearchTerm, storedActivoFilter, storedRoleFilter, currentPage, limit]);

    // Efecto principal para la carga de datos
    // Este useEffect se dispara cada vez que 'loadEmpleados' cambia (es decir,
    // cuando cualquier dependencia de 'loadEmpleados' useCallback cambia en el store).
    // Esto asegura que la tabla se refresque automáticamente cuando el término de búsqueda,
    // filtros, página o límite cambian en el store de Redux.
    useEffect(() => {
        loadEmpleados();
    }, [loadEmpleados]); // Única dependencia: la función memoizada loadEmpleados

    // Efecto para gestionar las notificaciones temporales
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.message]);

    // Manejadores de eventos para modales y CRUD
    const handleOpenCreateModal = () => {
        setModalMode('create');
        setSelectedEmpleado(null);
        setIsEmpleadoModalOpen(true);
    };

    const handleOpenEditModal = (empleado) => {
        setModalMode('edit');
        setSelectedEmpleado(empleado);
        setIsEmpleadoModalOpen(true);
    };

    const handleCloseEmpleadoModal = () => {
        setIsEmpleadoModalOpen(false);
        setSelectedEmpleado(null);
        if (empleadosError) {
            dispatch(clearEmpleadosError());
        }
    };

    const handleSaveEmpleado = async (empleadoData) => {
        try {
            if (modalMode === 'create') {
                await dispatch(createEmpleado(empleadoData)).unwrap();
                setNotification({ message: 'Empleado creado exitosamente.', type: 'success' });
                dispatch(setEmpleadoPage(1)); // Volver a la primera página tras la creación
            } else { // Asumimos modalMode es 'edit'
                await dispatch(updateEmpleado({ id_empleado: selectedEmpleado.id_empleado, updateData: empleadoData })).unwrap();
                setNotification({ message: 'Empleado actualizado exitosamente.', type: 'success' });
                // Después de la actualización, recargar para reflejar cambios en la lista actual.
                // Esto se hace explícitamente ya que un cambio en un solo ítem no necesariamente
                // cambia las dependencias de loadEmpleados que dispararían el useEffect.
                loadEmpleados(); 
            }
            handleCloseEmpleadoModal();
        } catch (error) {
            console.error("Error al guardar empleado:", error);
            setNotification({ message: error.message || 'Error al guardar el empleado.', type: 'error' });
        }
    };

    const handleOpenConfirmationModal = (id_empleado) => {
        setEmpleadoToDeleteId(id_empleado);
        setIsConfirmationModalOpen(true);
    };

    const handleCloseConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        setEmpleadoToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await dispatch(deleteEmpleado(empleadoToDeleteId)).unwrap();
            setNotification({ message: 'Empleado eliminado exitosamente.', type: 'success' });
            // Lógica para ajustar la paginación después de una eliminación
            // Si eliminamos el último elemento de la página y no es la primera, retrocedemos.
            if (empleados.length === 1 && currentPage > 1) {
                dispatch(setEmpleadoPage(currentPage - 1));
            } else {
                loadEmpleados(); // Recargar para reflejar la eliminación
            }
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
            setNotification({ message: error.message || 'Error al eliminar el empleado.', type: 'error' });
        } finally {
            handleCloseConfirmationModal();
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return faCheckCircle;
            case 'error': return faExclamationTriangle;
            case 'info': return faInfoCircle;
            default: return null;
        }
    };

    // Manejadores de paginación y filtros
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setEmpleadoPage(newPage)); // Esto disparará loadEmpleados
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        dispatch(setEmpleadoLimit(newLimit)); // Esto disparará loadEmpleados
        dispatch(setEmpleadoPage(1)); // Siempre volver a la página 1 al cambiar el límite
        setItemsPerPageUI(newLimit); // Actualizar estado local para el select
    };

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value); // Solo actualiza el estado local del input
        // El debounce useEffect se encargará de despachar setEmpleadoSearchTerm
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Cuando se envía el formulario (Enter o botón Buscar), forzamos la actualización inmediata
        // del término de búsqueda en Redux y reseteamos la página a 1.
        if (searchInput !== storedSearchTerm) { // Evitar dispatch si no ha cambiado
            dispatch(setEmpleadoSearchTerm(searchInput));
        }
        dispatch(setEmpleadoPage(1)); // Esto disparará loadEmpleados
    };

    const handleActivoFilterChange = (e) => {
        const value = e.target.value; // 'true', 'false', o ''
        setActivoFilterUI(value); // Actualiza el estado local del select

        // Despacha el cambio al store, convirtiendo 'true'/'false' a booleanos
        const dispatchedValue = value === 'true' ? true : value === 'false' ? false : '';
        dispatch(setEmpleadoActivoFilter(dispatchedValue));
        dispatch(setEmpleadoPage(1)); // Resetea a la primera página con el nuevo filtro
    };

    const handleRoleFilterChange = (e) => {
        const value = e.target.value;
        setRoleFilterUI(value); // Actualiza el estado local del select

        // Despacha el cambio al store y resetea la página
        dispatch(setEmpleadoRoleFilter(value));
        dispatch(setEmpleadoPage(1)); // Resetea a la primera página con el nuevo filtro
    };


    return (
        <div className={styles.empleadosPage}>
            <h1>Gestión de Empleados</h1>

            {/* Componente de Notificación */}
            {notification.message && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    {getNotificationIcon(notification.type) && (
                        <FontAwesomeIcon icon={getNotificationIcon(notification.type)} className={styles.notificationIcon} />
                    )}
                    <p>{notification.message}</p>
                </div>
            )}

            {/* Barra de Controles: Búsqueda, Filtros, Límite por Página y Botón Crear */}
            <div className={styles.controlsBar}>
                {/* Formulario de Búsqueda */}
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ID, usuario, contacto..."
                        value={searchInput} // Controlado por estado local
                        onChange={handleSearchInputChange}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>Buscar</button>
                </form>

                {/* Filtro por estado Activo */}
                <div className={styles.filterGroup}>
                    <label htmlFor="activoFilter">Estado:</label>
                    <select
                        id="activoFilter"
                        value={activoFilterUI} // Controlado por estado local
                        onChange={handleActivoFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="">Todos</option>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                </div>

                {/* Filtro por Rol */}
                <div className={styles.filterGroup}>
                    <label htmlFor="roleFilter">Rol:</label>
                    <select
                        id="roleFilter"
                        value={roleFilterUI} // Controlado por estado local
                        onChange={handleRoleFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="">Todos</option>
                        <option value="empleado">Empleado</option>
                        <option value="gerente">Gerente</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* Selector de Elementos por Página */}
                <div className={styles.paginationLimit}>
                    <span>Mostrar:</span>
                    <select value={itemsPerPageUI} onChange={handleLimitChange} className={styles.selectLimit}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    <span>por página</span>
                </div>

                {/* Botón para Crear Nuevo Empleado */}
                <button className={styles.createButton} onClick={handleOpenCreateModal}>
                    <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
                    Crear Nuevo Empleado
                </button>
            </div>

            {/* Indicador de Carga */}
            {empleadosStatus === 'loading' && (
                <div className={styles.loadingContainer}>
                    <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
                    <p>Cargando empleados...</p>
                </div>
            )}

            {/* Mensaje de Error al Cargar Empleados */}
            {empleadosStatus === 'failed' && empleadosError && (
                <div className={`${styles.errorContainer} ${styles.notificationError}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
                    <p>Error al cargar los empleados: {empleadosError}</p>
                    <button className={styles.retryButton} onClick={loadEmpleados}>Reintentar</button>
                </div>
            )}

            {/* Mensaje cuando no hay empleados o no hay resultados de búsqueda */}
            {empleadosStatus === 'succeeded' && totalItems === 0 && !storedSearchTerm && storedActivoFilter === '' && storedRoleFilter === '' ? (
                <div className={styles.noEmpleados}>
                    <p>No hay empleados registrados. ¡Crea el primero!</p>
                </div>
            ) : (empleadosStatus === 'succeeded' && totalItems === 0 && (storedSearchTerm || storedActivoFilter !== '' || storedRoleFilter !== '')) ? (
                <div className={styles.noEmpleados}>
                    <p>No se encontraron empleados que coincidan con los criterios de búsqueda/filtro.</p>
                </div>
            ) : null}


            {/* Tabla de Empleados (solo se muestra si hay datos y se han cargado exitosamente) */}
            {empleadosStatus === 'succeeded' && totalItems > 0 && (
                <>
                    <div className={styles.empleadosTableContainer}>
                        <table className={styles.empleadosTable}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Usuario</th>
                                    <th>Cargo</th>
                                    <th>Contacto</th>
                                    <th>Rol</th>
                                    <th>Activo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empleados.map((empleado) => (
                                    <tr 
                                        key={empleado.id_empleado} 
                                        onClick={() => handleOpenEditModal(empleado)} 
                                        className={styles.tableRowClickable}
                                    >
                                        <td data-label="Nombre">{empleado.nombre}</td>
                                        <td data-label="Apellido">{empleado.apellido || 'N/A'}</td>
                                        <td data-label="Usuario">{empleado.username}</td>
                                        <td data-label="Cargo">{empleado.cargo || 'N/A'}</td>
                                        <td data-label="Contacto">{empleado.contacto || 'N/A'}</td>
                                        <td data-label="Rol">{empleado.role}</td>
                                        <td data-label="Activo">
                                            {empleado.activo ? (
                                                <span className={styles.statusActive}>Sí</span>
                                            ) : (
                                                <span className={styles.statusInactive}>No</span>
                                            )}
                                        </td>
                                        <td data-label="Acciones" className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleOpenEditModal(empleado)}
                                                title="Editar Empleado"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleOpenConfirmationModal(empleado.id_empleado)}
                                                title="Eliminar Empleado"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Controles de Paginación */}
                    <div className={styles.paginationControls}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={styles.paginationButton}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages} ({totalItems} empleados)</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={styles.paginationButton}
                        >
                            Siguiente <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </>
            )}

            {/* Modales */}
            <EmpleadoDetailModal
                isOpen={isEmpleadoModalOpen}
                onClose={handleCloseEmpleadoModal}
                mode={modalMode}
                initialData={selectedEmpleado}
                onSave={handleSaveEmpleado}
            />

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleConfirmDelete}
                message="¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer."
            />
            <Footer/>
        </div>
        
    );
};

export default EmpleadosPage;
