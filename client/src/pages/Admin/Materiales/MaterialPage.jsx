import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPaginatedMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    selectAllMaterials,
    selectMaterialsStatus,
    selectMaterialsError,
    selectCurrentPage,
    selectTotalPages,
    selectTotalItems,
    selectLimit,
    setMaterialPage,
    setMaterialLimit,
    clearMaterialsError,
    resetMaterialsStatus,
} from '../../../features/materiales/materialsSlice';
import MaterialDetailModal from './MaterialDetailModal';
import ConfirmationModal from './ConfirmationModal';
import styles from './MaterialPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSpinner, faCheckCircle, faExclamationTriangle, faInfoCircle, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const MaterialesPage = () => {
    const dispatch = useDispatch();
    const materials = useSelector(selectAllMaterials);
    const materialsStatus = useSelector(selectMaterialsStatus);
    const materialsError = useSelector(selectMaterialsError);
    const currentPage = useSelector(selectCurrentPage);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);
    const limit = useSelector(selectLimit);

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', or 'view'
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [materialToDeleteId, setMaterialToDeleteId] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // Estado para el término de búsqueda y su versión debounced
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Estado para el límite de elementos por página (sincronizado con el estado de Redux)
    const [itemsPerPage, setItemsPerPage] = useState(limit); 

    // Sincronizar itemsPerPage con el límite de Redux al cargar o cambiar el límite en Redux
    // Esto asegura que el dropdown refleje el valor actual del store
    useEffect(() => {
        setItemsPerPage(limit);
    }, [limit]);

    // Efecto para debounce del searchTerm
    // Este useEffect se activa cada vez que 'searchTerm' cambia
    // Establece un temporizador para actualizar 'debouncedSearchTerm' después de un breve retraso.
    // Si 'searchTerm' cambia de nuevo antes de que el temporizador termine, el temporizador anterior se limpia.
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de retraso para el debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); // Se ejecuta cada vez que searchTerm cambia

    // Función para cargar materiales con los parámetros actuales (paginación y búsqueda)
    // Se utiliza useCallback para memoizar la función. Esto es crucial porque:
    // 1. Evita que la función 'loadMaterials' se recree en cada render, lo que podría causar bucles en useEffect.
    // 2. Asegura que el 'useEffect' principal solo se dispare cuando las dependencias reales de la *lógica de carga* cambien.
    const loadMaterials = useCallback(() => {
        dispatch(fetchPaginatedMaterials({
            searchTerm: debouncedSearchTerm, // Usa el término de búsqueda debounced
            page: currentPage,
            limit: itemsPerPage
        }));
    }, [dispatch, debouncedSearchTerm, currentPage, itemsPerPage]); // Dependencias que si cambian, 'loadMaterials' se recrea

    // Efecto principal para iniciar la carga de materiales y reintentos de error
    // Este useEffect se encarga de que 'loadMaterials' se ejecute cuando cualquiera de sus
    // dependencias (debouncedSearchTerm, currentPage, itemsPerPage) cambie.
    // También maneja la carga inicial y reintentos después de un fallo.
    useEffect(() => {
        // SIMPLIFICADO: Ahora el useEffect simplemente llama a loadMaterials.
        // La lógica de cuándo se debe recargar (por cambio de filtros/página)
        // está en las dependencias del useCallback de loadMaterials.
        // Esto es similar a cómo funciona TrabajoGestionPage.
        loadMaterials();
    }, [loadMaterials]); // Depende únicamente de la función memoizada loadMaterials

    // Efecto para gestionar las notificaciones temporales
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 5000); // La notificación desaparecerá después de 5 segundos
            return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta o el mensaje cambia
        }
    }, [notification.message]); // Se ejecuta cuando el mensaje de notificación cambia

    // Abre el modal para crear un nuevo material
    const handleOpenCreateModal = () => {
        setModalMode('create');
        setSelectedMaterial(null); // Asegura que no haya datos precargados
        setIsMaterialModalOpen(true);
    };

    // Abre el modal para editar un material existente
    const handleOpenEditModal = (material) => {
        setModalMode('edit');
        setSelectedMaterial(material); // Precarga el material a editar
        setIsMaterialModalOpen(true);
    };

    // Abre el modal en modo 'edit' (puede ser 'view' si el modal lo soporta) al hacer clic en la fila
    const handleOpenViewOrEditModal = (material) => {
        setModalMode('edit'); 
        setSelectedMaterial(material);
        setIsMaterialModalOpen(true);
    };

    // Cierra el modal de detalle/edición de material
    const handleCloseMaterialModal = () => {
        setIsMaterialModalOpen(false);
        setSelectedMaterial(null);
        // Limpiar cualquier error relacionado con los materiales del store al cerrar el modal
        if (materialsError) {
            dispatch(clearMaterialsError());
        }
    };

    // Maneja la acción de guardar (crear o actualizar) un material
    const handleSaveMaterial = async (materialData) => {
        try {
            if (modalMode === 'create') {
                await dispatch(createMaterial(materialData)).unwrap(); // .unwrap() lanza el error si el thunk falla
                setNotification({ message: 'Material creado exitosamente.', type: 'success' });
                // Después de la creación, es mejor resetear a la primera página para ver el nuevo material.
                // El cambio de 'currentPage' disparará 'loadMaterials' automáticamente a través del useEffect.
                dispatch(setMaterialPage(1)); 
            } else { // Asumimos modalMode es 'edit'
                await dispatch(updateMaterial({ id_material: selectedMaterial.id_material, updateData: materialData })).unwrap();
                setNotification({ message: 'Material actualizado exitosamente.', type: 'success' });
                // Después de la actualización, recargar materiales para reflejar los cambios.
                // loadMaterials se disparará porque sus dependencias (debouncedSearchTerm, currentPage, itemsPerPage)
                // no han cambiado, y necesitamos una recarga explícita con la misma query.
                loadMaterials(); 
            }
            handleCloseMaterialModal(); // Cierra el modal solo si la operación fue exitosa
        } catch (error) {
            console.error("Error al guardar material:", error);
            setNotification({ message: error.message || 'Error al guardar el material.', type: 'error' });
            // No se cierra el modal automáticamente en caso de error para que el usuario pueda corregir los datos.
        }
    };

    // Abre el modal de confirmación antes de eliminar
    const handleOpenConfirmationModal = (id_material) => {
        setMaterialToDeleteId(id_material);
        setIsConfirmationModalOpen(true);
    };

    // Cierra el modal de confirmación
    const handleCloseConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        setMaterialToDeleteId(null);
    };

    // Confirma y ejecuta la eliminación de un material
    const handleConfirmDelete = async () => {
        try {
            await dispatch(deleteMaterial(materialToDeleteId)).unwrap();
            setNotification({ message: 'Material eliminado exitosamente.', type: 'success' });
            
            // Lógica para ajustar la paginación después de una eliminación:
            // Si eliminamos el último elemento de una página y no es la primera página,
            // volvemos a la página anterior para evitar una página vacía.
            if (materials.length === 1 && currentPage > 1) { // Si es el último elemento de la página actual
                dispatch(setMaterialPage(currentPage - 1)); // Esto disparará loadMaterials
            } else {
                 // En cualquier otro caso (no es el último elemento, o estamos en la primera página),
                 // simplemente recargamos los materiales de la página actual.
                loadMaterials(); // Llamada explícita a loadMaterials
            }
        } catch (error) {
            console.error("Error al eliminar material:", error);
            setNotification({ message: error.message || 'Error al eliminar el material.', type: 'error' });
        } finally {
            handleCloseConfirmationModal(); // Siempre cierra el modal de confirmación
        }
    };

    // Determina el icono de notificación según el tipo
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return faCheckCircle;
            case 'error':
                return faExclamationTriangle;
            case 'info':
                return faInfoCircle;
            default:
                return null;
        }
    };

    // Manejador para cambiar la página de la tabla
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setMaterialPage(newPage));
            // La actualización de 'currentPage' en Redux disparará 'loadMaterials' debido a useCallback.
        }
    };

    // Manejador para cambiar el límite de elementos por página
    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        dispatch(setMaterialLimit(newLimit)); // Actualiza el límite en el store
        dispatch(setMaterialPage(1)); // Vuelve a la primera página con el nuevo límite
        // La actualización de 'limit' y 'currentPage' en Redux disparará 'loadMaterials'.
    };

    // Manejador para los cambios en el input de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // El debounce establecido en el useEffect se encargará de actualizar 'debouncedSearchTerm',
        // lo que a su vez hará que 'loadMaterials' se ejecute con el término final.
    };

    // Manejador para el envío del formulario de búsqueda (al presionar Enter o el botón "Buscar")
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (recarga de página)
        // Forzamos la actualización inmediata del término debounced para que la búsqueda se realice al instante.
        setDebouncedSearchTerm(searchTerm); 
        dispatch(setMaterialPage(1)); // Reinicia a la primera página con la nueva búsqueda
        // La actualización de 'debouncedSearchTerm' y 'currentPage' disparará 'loadMaterials'.
    };


    return (
        <div className={styles.materialesPage}>
            <h1>Gestión de Materiales</h1>

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
                        placeholder="Buscar por nombre, ID o código..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>Buscar</button>
                </form>

                {/* Selector de Elementos por Página */}
                <div className={styles.paginationLimit}>
                    <span>Mostrar:</span>
                    <select value={itemsPerPage} onChange={handleLimitChange} className={styles.selectLimit}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    <span>por página</span>
                </div>

                {/* Botón para Crear Nuevo Material */}
                <button className={styles.createButton} onClick={handleOpenCreateModal}>
                    <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
                    Crear Nuevo Material
                </button>
            </div>

            {/* Indicador de Carga */}
            {materialsStatus === 'loading' && (
                <div className={styles.loadingContainer}>
                    <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
                    <p>Cargando materiales...</p>
                </div>
            )}

            {/* Mensaje de Error al Cargar Materiales */}
            {materialsStatus === 'failed' && materialsError && (
                <div className={`${styles.errorContainer} ${styles.notificationError}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
                    <p>Error al cargar los materiales: {materialsError}</p>
                    <button className={styles.retryButton} onClick={loadMaterials}>Reintentar</button>
                </div>
            )}

            {/* Mensaje cuando no hay materiales o no hay resultados de búsqueda */}
            {materialsStatus === 'succeeded' && totalItems === 0 && !searchTerm && (
                <div className={styles.noMaterials}>
                    <p>No hay materiales registrados. ¡Crea el primero!</p>
                </div>
            )}

            {materialsStatus === 'succeeded' && totalItems === 0 && searchTerm && (
                <div className={styles.noMaterials}>
                    <p>No se encontraron materiales para su búsqueda: "{searchTerm}".</p>
                </div>
            )}

            {/* Tabla de Materiales (solo se muestra si hay datos y se han cargado exitosamente) */}
            {materialsStatus === 'succeeded' && totalItems > 0 && (
                <>
                    <div className={styles.materialsTableContainer}>
                        <table className={styles.materialsTable}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Código</th>
                                    <th>Unidad Medida</th>
                                    <th>Costo Unitario</th>
                                    <th>Stock Actual</th>
                                    <th>Disponible para Cotización</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((material) => (
                                    <tr 
                                        key={material.id_material} 
                                        onClick={() => handleOpenViewOrEditModal(material)} 
                                        className={styles.tableRowClickable}
                                    >
                                        <td data-label="Nombre">{material.nombre}</td>
                                        <td data-label="Código">{material.codigo || 'N/A'}</td>
                                        <td data-label="Unidad Medida">{material.unidad_medida}</td>
                                        <td data-label="Costo Unitario">
                                            ${material.costo_por_unidad ? parseFloat(material.costo_por_unidad).toFixed(2) : '0.00'}
                                        </td>
                                        <td data-label="Stock Actual">
                                            {material.stock_actual !== null ? material.stock_actual : 'N/A'}
                                        </td>
                                        <td data-label="Disponible para Cotización">
                                            {material.disponible_para_cotizacion ? (
                                                <span className={styles.statusActive}>Sí</span>
                                            ) : (
                                                <span className={styles.statusInactive}>No</span>
                                            )}
                                        </td>
                                        <td data-label="Acciones" className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleOpenEditModal(material)}
                                                title="Editar Material"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleOpenConfirmationModal(material.id_material)}
                                                title="Eliminar Material"
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
                        <span>Página {currentPage} de {totalPages} ({totalItems} materiales)</span>
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
            <MaterialDetailModal
                isOpen={isMaterialModalOpen}
                onClose={handleCloseMaterialModal}
                mode={modalMode}
                initialData={selectedMaterial}
                onSave={handleSaveMaterial}
            />

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleConfirmDelete}
                message="¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default MaterialesPage;
