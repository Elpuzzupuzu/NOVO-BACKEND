import React from 'react';
import { useSelector } from 'react-redux'; // Necesario para selectUser
import { selectUser } from '../../../features/auth/authSlice';
import styles from './ClientCotizacionDetailModal.module.css'; // Usaremos un nuevo archivo CSS para estilos específicos del cliente

const ClientCotizacionDetailModal = ({ isOpen, onClose, cotizacion }) => {
    const user = useSelector(selectUser);

    // Si el modal no está abierto o no hay cotización, no renderizar nada
    if (!isOpen || !cotizacion) {
        return null;
    }

    // Función auxiliar para renderizar el valor del campo
    const renderFieldValue = (value, type = 'text') => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        if (type === 'date') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        }

        if (type === 'currency') {
            return `$${parseFloat(value).toFixed(2)}`;
        }

        if (type === 'boolean') {
            return value ? 'Sí' : 'No';
        }

        return value.toString();
    };

    const clientFullName = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Cliente';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2 className={styles.modalTitle}>
                    Detalle de Cotización <span className={styles.cotizacionId}>#{cotizacion.id_cotizacion.substring(0, 8)}...</span>
                </h2>

                <div className={styles.formGrid}>
                    {/* Información del Cliente (solo visualización, ya es el cliente logueado) */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Cliente:</label>
                        <p className={styles.fieldValue}>{clientFullName || 'N/A'}</p>
                    </div>

                    {/* ID de la Cotización completo (para referencia) */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>ID Completo:</label>
                        <p className={styles.fieldValue}>{cotizacion.id_cotizacion}</p>
                    </div>

                    {/* Campos visibles para el Cliente */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Tipo de Producto:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.tipo_producto)}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Material Base:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.material_nombre)}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Color de Tela:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.color_tela)}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Metros Estimados:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.metros_estimados, 'number')}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Diseño Personalizado:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.diseno_personalizado, 'boolean')}</p>
                    </div>

                    {cotizacion.diseno_personalizado && (
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.modalLabel}>Descripción del Diseño:</label>
                            <p className={styles.fieldValue}>{renderFieldValue(cotizacion.descripcion_diseno)}</p>
                        </div>
                    )}

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.modalLabel}>Notas Adicionales:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.notas_adicionales)}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Estado:</label>
                        <p className={`${styles.fieldValue} ${styles.statusBadge} ${styles[cotizacion.estado.toLowerCase().replace(/ /g, '_')]}`}>
                            {renderFieldValue(cotizacion.estado).replace(/_/g, ' ')}
                        </p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Total Estimado:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.total_estimado, 'currency')}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Anticipo Requerido:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.anticipo_requerido, 'currency')}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Monto Anticipo Pagado:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.monto_anticipo_pagado, 'currency')}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Método Pago Anticipo:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.metodo_pago_anticipo)}</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Pago Anticipo:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.fecha_pago_anticipo, 'date')}</p>
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Agendada:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.fecha_agendada, 'date')}</p>
                    </div>

                    {/* Campos de Fecha de SOLO LECTURA que también son relevantes */}
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Fecha Solicitud:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.fecha_solicitud, 'date')}</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.modalLabel}>Última Actualización:</label>
                        <p className={styles.fieldValue}>{renderFieldValue(cotizacion.fecha_actualizacion, 'date')}</p>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.closeModalButton}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientCotizacionDetailModal;