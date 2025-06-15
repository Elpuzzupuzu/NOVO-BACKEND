import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    selectAllMaterials,
    selectMaterialsStatus,
    selectMaterialsError,
    clearMaterialsError,
    resetMaterialsStatus,
} from '../../../features/materiales/materialsSlice';
import MaterialDetailModal from './MaterialDetailModal';
import ConfirmationModal from './ConfirmationModal';
import styles from './MaterialPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSpinner, faCheckCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const MaterialesPage = () => {
    const dispatch = useDispatch();
    const materials = useSelector(selectAllMaterials);
    const materialsStatus = useSelector(selectMaterialsStatus);
    const materialsError = useSelector(selectMaterialsError);

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', or 'view'
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [materialToDeleteId, setMaterialToDeleteId] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        if (materialsStatus === 'idle' || (materialsStatus === 'failed' && !materialsError)) {
            dispatch(fetchMaterials());
        }
    }, [materialsStatus, materialsError, dispatch]);

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.message]);

    useEffect(() => {
        // Este useEffect dispara resetMaterialsStatus después de una operación CRUD exitosa
        // Y cuando la notificación no es la genérica "Operación completada exitosamente."
        // que podría indicar un fetch inicial o un estado final de éxito sin mutación.
        // La lógica en materialsSlice.js:resetMaterialsStatus ahora previene el bucle.
        if (materialsStatus === 'succeeded' && notification.type === 'success' && notification.message !== 'Operación completada exitosamente.') {
            dispatch(resetMaterialsStatus());
        }
    }, [materialsStatus, notification.type, notification.message, dispatch]);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setSelectedMaterial(null);
        setIsMaterialModalOpen(true);
    };

    const handleOpenEditModal = (material) => {
        setModalMode('edit');
        setSelectedMaterial(material);
        setIsMaterialModalOpen(true);
    };

    // NUEVA FUNCIÓN: Abre el modal en modo 'view' o 'edit' al hacer clic en la fila
    const handleOpenViewOrEditModal = (material) => {
        // Puedes decidir si quieres un modo 'view' dedicado o directamente 'edit'
        // Si MaterialDetailModal no tiene un modo 'view', puedes usar 'edit' y el modal
        // simplemente se precargará con los datos.
        setModalMode('edit'); // O 'view' si tu modal lo soporta y lo prefieres
        setSelectedMaterial(material);
        setIsMaterialModalOpen(true);
    };

    const handleCloseMaterialModal = () => {
        setIsMaterialModalOpen(false);
        setSelectedMaterial(null);
    };

    const handleSaveMaterial = async (materialData) => {
        try {
            if (modalMode === 'create') {
                await dispatch(createMaterial(materialData)).unwrap();
                setNotification({ message: 'Material creado exitosamente.', type: 'success' });
            } else { // Asumimos modalMode es 'edit'
                await dispatch(updateMaterial({ id_material: selectedMaterial.id_material, updateData: materialData })).unwrap();
                setNotification({ message: 'Material actualizado exitosamente.', type: 'success' });
            }
            handleCloseMaterialModal();
        } catch (error) {
            console.error("Error al guardar material:", error);
            setNotification({ message: error.message || 'Error al guardar el material.', type: 'error' });
            // Si hay un error, puedes considerar no cerrar el modal o mostrar el error dentro del modal
        }
    };

    const handleOpenConfirmationModal = (id_material) => {
        setMaterialToDeleteId(id_material);
        setIsConfirmationModalOpen(true);
    };

    const handleCloseConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        setMaterialToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await dispatch(deleteMaterial(materialToDeleteId)).unwrap();
            setNotification({ message: 'Material eliminado exitosamente.', type: 'success' });
        } catch (error) {
            console.error("Error al eliminar material:", error);
            setNotification({ message: error.message || 'Error al eliminar el material.', type: 'error' });
        } finally {
            handleCloseConfirmationModal();
        }
    };

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

    return (
        <div className={styles.materialesPage}>
            <h1>Gestión de Materiales</h1>

            {notification.message && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    {getNotificationIcon(notification.type) && (
                        <FontAwesomeIcon icon={getNotificationIcon(notification.type)} className={styles.notificationIcon} />
                    )}
                    <p>{notification.message}</p>
                </div>
            )}

            <div className={styles.actionsBar}>
                <button className={styles.createButton} onClick={handleOpenCreateModal}>
                    <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
                    Crear Nuevo Material
                </button>
            </div>

            {materialsStatus === 'loading' && (
                <div className={styles.loadingContainer}>
                    <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
                    <p>Cargando materiales...</p>
                </div>
            )}

            {materialsStatus === 'failed' && !notification.message && (
                <div className={`${styles.errorContainer} ${styles.notificationError}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
                    <p>Error al cargar los materiales: {materialsError}</p>
                    <button className={styles.retryButton} onClick={() => dispatch(fetchMaterials())}>Reintentar</button>
                </div>
            )}

            {materialsStatus === 'succeeded' && materials.length === 0 && (
                <div className={styles.noMaterials}>
                    <p>No hay materiales registrados. ¡Crea el primero!</p>
                </div>
            )}

            {materialsStatus === 'succeeded' && materials.length > 0 && (
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
                                // AÑADIDO: onClick a la fila para abrir el modal
                                <tr key={material.id_material} onClick={() => handleOpenViewOrEditModal(material)} className={styles.tableRowClickable}>
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
                                        {/* Importante: e.stopPropagation() para evitar que el click en el botón
                                            tambien dispare el click de la fila */}
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
            )}

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