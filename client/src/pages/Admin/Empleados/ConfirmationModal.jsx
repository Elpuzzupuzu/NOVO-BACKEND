import React from 'react';
import styles from './ConfirmationModal.module.css'; // Asegúrate de que esta ruta sea correcta y el archivo exista
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente de modal de confirmación genérico.
 * Muestra un mensaje y botones para confirmar o cancelar una acción.
 *
 * @param {object} props - Las props del componente.
 * @param {boolean} props.isOpen - Si el modal debe estar abierto (true) o cerrado (false).
 * @param {function} props.onClose - Función a llamar cuando el modal debe cerrarse (ej. al cancelar o hacer clic fuera).
 * @param {function} props.onConfirm - Función a llamar cuando la acción es confirmada.
 * @param {string} props.message - El mensaje de confirmación a mostrar al usuario.
 * @param {string} [props.confirmText='Confirmar'] - Texto para el botón de confirmar.
 * @param {string} [props.cancelText='Cancelar'] - Texto para el botón de cancelar.
 * @returns {JSX.Element|null} El componente del modal o null si no está abierto.
 */
const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    message, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar' 
}) => {
    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    // Maneja el clic en el overlay para cerrar el modal (si se desea)
    // Se asegura de que el clic sea directamente en el overlay y no en el contenido del modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <FontAwesomeIcon icon={faQuestionCircle} className={styles.headerIcon} />
                        Confirmación
                    </h2>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar modal">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <p className={styles.messageText}>{message}</p>
                </div>
                <div className={styles.modalActions}>
                    <button onClick={onConfirm} className={styles.confirmButton}>
                        {confirmText}
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
