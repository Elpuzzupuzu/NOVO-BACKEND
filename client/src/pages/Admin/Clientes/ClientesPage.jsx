import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPaginatedClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    selectAllClientes,
    selectClientesStatus,
    selectClientesError,
    selectCurrentClientePage,
    selectTotalClientePages,
    selectTotalClientes,
    selectClienteLimit,
    selectClienteSearchTerm,
    setClientePage,
    setClienteLimit,
    setClienteSearchTerm,
    clearClientesError,
    resetClientesStatus,
} from '../../../features/clientes/clientesSlice';
import ClienteDetailModal from './ClienteDetailModal'; // Asume que este modal existe
import ConfirmationModal from './ConfirmationModal'; // Asume que este modal existe
import styles from './ClientesPage.module.css'; // Asegúrate de crear este archivo CSS
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

const ClientesPage = () => {
    const dispatch = useDispatch();

    // Selectores del estado de Redux
    const clientes = useSelector(selectAllClientes);
    const clientesStatus = useSelector(selectClientesStatus);
    const clientesError = useSelector(selectClientesError);
    const currentPage = useSelector(selectCurrentClientePage);
    const totalPages = useSelector(selectTotalClientePages);
    const totalItems = useSelector(selectTotalClientes);
    const limit = useSelector(selectClienteLimit);
    const storedSearchTerm = useSelector(selectClienteSearchTerm);

    // Estados locales para la UI y la lógica de debounce
    const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [clienteToDeleteId, setClienteToDeleteId] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // Estado local para el input de búsqueda (controlado por el usuario)
    const [searchInput, setSearchInput] = useState(storedSearchTerm);
    
    // Estado para el límite de elementos por página (controlado por el usuario), sincronizado con Redux
    const [itemsPerPageUI, setItemsPerPageUI] = useState(limit); 

    // Sincronizar el estado local de itemsPerPageUI con el límite del store si cambia externamente
    useEffect(() => {
        setItemsPerPageUI(limit);
    }, [limit]);

    // Sincronizar el estado local de searchInput con el storedSearchTerm si cambia externamente
    useEffect(() => {
        setSearchInput(storedSearchTerm);
    }, [storedSearchTerm]);

    // Efecto para debounce del término de búsqueda (actualiza el store)
    // Este useEffect se activa cada vez que 'searchInput' (el estado del input) cambia.
    // Establece un temporizador para despachar 'setClienteSearchTerm' después de un breve retraso.
    // Si 'searchInput' cambia de nuevo antes de que el temporizador termine, el temporizador anterior se limpia.
    useEffect(() => {
        const handler = setTimeout(() => {
            // Despachar solo si el valor local es diferente del valor ya en el store
            // para evitar despachos redundantes si el debounce se resuelve con el mismo valor
            if (searchInput !== storedSearchTerm) { 
                dispatch(setClienteSearchTerm(searchInput));
                dispatch(setClientePage(1)); // Resetear a la primera página con la nueva búsqueda
            }
        }, 500); // 500ms de retraso para el debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchInput, dispatch, storedSearchTerm]); // Depende de searchInput y storedSearchTerm


    // Función memoizada para cargar clientes con los parámetros actuales del store
    // Se utilizará para todas las recargas de la tabla (inicial, paginación, filtros, CRUD).
    const loadClientes = useCallback(() => {
        const filters = {};
        // Solo añadir el término de búsqueda si no está vacío
        if (storedSearchTerm) {
            filters.searchTerm = storedSearchTerm;
        }

        dispatch(fetchPaginatedClientes({
            ...filters,
            page: currentPage,
            limit: limit
        }));
    }, [dispatch, storedSearchTerm, currentPage, limit]);

    // Efecto principal para la carga de datos
    // Este useEffect se dispara cada vez que 'loadClientes' cambia (es decir,
    // cuando cualquier dependencia de 'loadClientes' useCallback cambia en el store).
    // Esto asegura que la tabla se refresque automáticamente cuando el término de búsqueda,
    // página o límite cambian en el store de Redux.
    useEffect(() => {
        loadClientes();
    }, [loadClientes]); // Única dependencia: la función memoizada loadClientes

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
        setSelectedCliente(null);
        setIsClienteModalOpen(true);
    };

    const handleOpenEditModal = (cliente) => {
        setModalMode('edit');
        setSelectedCliente(cliente);
        setIsClienteModalOpen(true);
    };

    const handleCloseClienteModal = () => {
        setIsClienteModalOpen(false);
        setSelectedCliente(null);
        if (clientesError) {
            dispatch(clearClientesError());
        }
    };

    const handleSaveCliente = async (clienteData) => {
        try {
            if (modalMode === 'create') {
                await dispatch(createCliente(clienteData)).unwrap();
                setNotification({ message: 'Cliente creado exitosamente.', type: 'success' });
                dispatch(setClientePage(1)); // Volver a la primera página tras la creación
            } else { // Asumimos modalMode es 'edit'
                await dispatch(updateCliente({ id_cliente: selectedCliente.id_cliente, updateData: clienteData })).unwrap();
                setNotification({ message: 'Cliente actualizado exitosamente.', type: 'success' });
                // Después de la actualización, recargar para reflejar cambios en la lista actual.
                // Esto se hace explícitamente ya que un cambio en un solo ítem no necesariamente
                // cambia las dependencias de loadClientes que dispararían el useEffect.
                loadClientes(); 
            }
            handleCloseClienteModal();
        } catch (error) {
            console.error("Error al guardar cliente:", error);
            setNotification({ message: error.message || 'Error al guardar el cliente.', type: 'error' });
        }
    };

    const handleOpenConfirmationModal = (id_cliente) => {
        setClienteToDeleteId(id_cliente);
        setIsConfirmationModalOpen(true);
    };

    const handleCloseConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        setClienteToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await dispatch(deleteCliente(clienteToDeleteId)).unwrap();
            setNotification({ message: 'Cliente eliminado exitosamente.', type: 'success' });
            // Lógica para ajustar la paginación después de una eliminación
            // Si eliminamos el último elemento de la página y no es la primera, retrocedemos.
            if (clientes.length === 1 && currentPage > 1) {
                dispatch(setClientePage(currentPage - 1));
            } else {
                loadClientes(); // Recargar para reflejar la eliminación
            }
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            setNotification({ message: error.message || 'Error al eliminar el cliente.', type: 'error' });
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

    // Manejadores de paginación y búsqueda
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setClientePage(newPage)); // Esto disparará loadClientes
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        dispatch(setClienteLimit(newLimit)); // Esto disparará loadClientes
        dispatch(setClientePage(1)); // Siempre volver a la página 1 al cambiar el límite
        setItemsPerPageUI(newLimit); // Actualizar estado local para el select
    };

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value); // Solo actualiza el estado local del input
        // El debounce useEffect se encargará de despachar setClienteSearchTerm
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Cuando se envía el formulario (Enter o botón Buscar), forzamos la actualización inmediata
        // del término de búsqueda en Redux y reseteamos la página a 1.
        if (searchInput !== storedSearchTerm) { // Evitar dispatch si no ha cambiado
            dispatch(setClienteSearchTerm(searchInput));
        }
        dispatch(setClientePage(1)); // Esto disparará loadClientes
    };

    return (
        <div className={styles.clientesPage}>
            <h1>Gestión de Clientes</h1>

            {/* Componente de Notificación */}
            {notification.message && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    {getNotificationIcon(notification.type) && (
                        <FontAwesomeIcon icon={getNotificationIcon(notification.type)} className={styles.notificationIcon} />
                    )}
                    <p>{notification.message}</p>
                </div>
            )}

            {/* Barra de Controles: Búsqueda, Límite por Página y Botón Crear */}
            <div className={styles.controlsBar}>
                {/* Formulario de Búsqueda */}
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ID, usuario, contacto, email..."
                        value={searchInput} // Controlado por estado local
                        onChange={handleSearchInputChange}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>Buscar</button>
                </form>

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

                {/* Botón para Crear Nuevo Cliente */}
                <button className={styles.createButton} onClick={handleOpenCreateModal}>
                    <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Indicador de Carga */}
            {clientesStatus === 'loading' && (
                <div className={styles.loadingContainer}>
                    <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
                    <p>Cargando clientes...</p>
                </div>
            )}

            {/* Mensaje de Error al Cargar Clientes */}
            {clientesStatus === 'failed' && clientesError && (
                <div className={`${styles.errorContainer} ${styles.notificationError}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
                    <p>Error al cargar los clientes: {clientesError}</p>
                    <button className={styles.retryButton} onClick={loadClientes}>Reintentar</button>
                </div>
            )}

            {/* Mensaje cuando no hay clientes o no hay resultados de búsqueda */}
            {clientesStatus === 'succeeded' && totalItems === 0 && !storedSearchTerm ? (
                <div className={styles.noClientes}>
                    <p>No hay clientes registrados. ¡Crea el primero!</p>
                </div>
            ) : (clientesStatus === 'succeeded' && totalItems === 0 && storedSearchTerm) ? (
                <div className={styles.noClientes}>
                    <p>No se encontraron clientes que coincidan con su búsqueda: "{storedSearchTerm}".</p>
                </div>
            ) : null}


            {/* Tabla de Clientes (solo se muestra si hay datos y se han cargado exitosamente) */}
            {clientesStatus === 'succeeded' && totalItems > 0 && (
                <>
                    <div className={styles.clientesTableContainer}>
                        <table className={styles.clientesTable}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Usuario</th>
                                    <th>Contacto</th>
                                    <th>Email</th>
                                    <th>Dirección</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((cliente) => (
                                    <tr 
                                        key={cliente.id_cliente} 
                                        onClick={() => handleOpenEditModal(cliente)} 
                                        className={styles.tableRowClickable}
                                    >
                                        <td data-label="Nombre">{cliente.nombre}</td>
                                        <td data-label="Apellido">{cliente.apellido || 'N/A'}</td>
                                        <td data-label="Usuario">{cliente.username}</td>
                                        <td data-label="Contacto">{cliente.contacto}</td>
                                        <td data-label="Email">{cliente.email || 'N/A'}</td>
                                        <td data-label="Dirección">{cliente.direccion || 'N/A'}</td>
                                        <td data-label="Rol">{cliente.role}</td>
                                        <td data-label="Acciones" className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleOpenEditModal(cliente)}
                                                title="Editar Cliente"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleOpenConfirmationModal(cliente.id_cliente)}
                                                title="Eliminar Cliente"
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
                        <span>Página {currentPage} de {totalPages} ({totalItems} clientes)</span>
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
            <ClienteDetailModal
                isOpen={isClienteModalOpen}
                onClose={handleCloseClienteModal}
                mode={modalMode}
                initialData={selectedCliente}
                onSave={handleSaveCliente}
            />

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleConfirmDelete}
                message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
            />
            <Footer/>
        </div>
    );
};

export default ClientesPage;
