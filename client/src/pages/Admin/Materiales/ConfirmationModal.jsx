// client/src/components/ConfirmationModal/ConfirmationModal.jsx
import React from 'react';
import styles from './ConfirmationModal.module.css'; // Crea este CSS

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Confirmar Acción</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <p>{message}</p>
                </div>
                <div className={styles.modalActions}>
                    <button className={styles.confirmButton} onClick={onConfirm}>Confirmar</button>
                    <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;