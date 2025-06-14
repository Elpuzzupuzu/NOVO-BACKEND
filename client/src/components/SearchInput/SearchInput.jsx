// src/components/SearchInput/SearchInput.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './SearchInput.module.css'; 

const SearchInput = ({ initialSearchTerm, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || ''); 
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm || '');

    // Sincroniza el estado local con el prop inicial si este cambia
    useEffect(() => {
        setSearchTerm(initialSearchTerm || '');
        setDebouncedSearchTerm(initialSearchTerm || '');
    }, [initialSearchTerm]);

    // Lógica de debouncing
    useEffect(() => {
        const handler = setTimeout(() => {
            // >>> CAMBIO CLAVE: Recortar espacios en blanco del `searchTerm` antes de asignarlo al debounced
            setDebouncedSearchTerm(searchTerm.trim()); 
        }, 800); // 500ms de retraso

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); 

    // Disparar la función de búsqueda prop cuando el término debounced cambia
    useEffect(() => {
        // Aseguramos que la búsqueda se dispare incluso con un término vacío si `onSearch` lo espera.
        // `debouncedSearchTerm` ya está trimmeado aquí.
        onSearch(debouncedSearchTerm);
        
    }, [debouncedSearchTerm, onSearch]); 

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <input
            type="text"
            placeholder="Buscar por ID o nombre de cliente" 
            className={styles.searchInput}
            value={searchTerm} 
            onChange={handleChange}
        />
    );
};

export default React.memo(SearchInput);