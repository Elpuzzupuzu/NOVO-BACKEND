// src/components/SearchInput/SearchInput.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './SearchInput.module.css'; // Asegúrate de crear este archivo CSS si lo necesitas

const SearchInput = ({ initialSearchTerm, onSearch }) => {
    // searchTerm: el valor actual del input (se actualiza en cada tecleo)
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || ''); 
    // debouncedSearchTerm: el valor que se usa para la búsqueda (se actualiza después del retraso)
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm || '');

    // Sincroniza el estado local con el prop inicial si este cambia
    useEffect(() => {
        setSearchTerm(initialSearchTerm || '');
        setDebouncedSearchTerm(initialSearchTerm || '');
    }, [initialSearchTerm]);

    // Lógica de debouncing
    useEffect(() => {
        // Establecer un temporizador
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de retraso (ajusta este valor si lo consideras necesario)

        // Limpiar el temporizador si el `searchTerm` cambia antes de que se dispare
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); // Se ejecuta cada vez que `searchTerm` cambia

    // Disparar la función de búsqueda prop cuando el término debounced cambia
    useEffect(() => {
        // Solo llama a onSearch si el debouncedSearchTerm ha cambiado significativamente
        // o si es la primera carga y initialSearchTerm tiene un valor (para evitar búsqueda vacía inicial)
        // Puedes ajustar la condición de if (!debouncedSearchTerm && !initialSearchTerm) si prefieres
        // que no se haga una búsqueda inicial con término vacío.
        
        // La condición ajustada: llama a onSearch si debouncedSearchTerm ha cambiado
        // o si estamos en la primera carga y no hay un initialSearchTerm para buscar.
        // Si quieres que siempre se busque al montar si initialSearchTerm no es vacío,
        // simplemente onSearch(debouncedSearchTerm);
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
            value={searchTerm} // El input siempre muestra `searchTerm` para la visualización inmediata
            onChange={handleChange}
        />
    );
};

// Memoizamos el componente para evitar re-renderizaciones innecesarias
// y preservar el foco del input.
export default React.memo(SearchInput);