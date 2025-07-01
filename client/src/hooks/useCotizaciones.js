// client/src/hooks/useCotizaciones.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Define la URL base de la API para consistencia
const API_BASE_URL = import.meta.env.VITE_API_HOOKS || 'http://localhost:3000/NOVO';

const useCotizaciones = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [isLoadingCotizaciones, setIsLoadingCotizaciones] = useState(true);
    const [errorCotizaciones, setErrorCotizaciones] = useState(null);

    useEffect(() => {
        const fetchCotizaciones = async () => {
            setIsLoadingCotizaciones(true);
            setErrorCotizaciones(null);
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setErrorCotizaciones('Authentication token not found. Please log in.');
                    setIsLoadingCotizaciones(false);
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/cotizaciones?limit=9999`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // CAMBIO CRÍTICO AQUÍ: Acceder a response.data.data
                // El servicio devuelve { data: [], pagination: {} }, así que el array de cotizaciones está en .data.data
                const cotizacionesData = response.data.data;

                if (cotizacionesData && Array.isArray(cotizacionesData)) {
                    setCotizaciones(cotizacionesData.map(cot => ({
                        id: cot.id_cotizacion, // ASEGÚRATE DE QUE ESTE ES EL NOMBRE CORRECTO DEL ID EN TU BD
                        // Ajusta el label según lo que quieras mostrar.
                        // Asumo que 'nombre_cliente' viene en el objeto de cotización.
                        label: `Cotización #${cot.id_cotizacion} - Cliente: ${cot.nombre_cliente || 'N/A'}`
                    })));
                } else {
                    console.warn("La respuesta de cotizaciones no tiene el formato esperado (response.data.data no es un array):", response.data);
                    setErrorCotizaciones("Formato de datos de cotizaciones inesperado.");
                    setCotizaciones([]);
                }

            } catch (err) {
                console.error('Error al cargar cotizaciones:', err);
                if (err.response) {
                    setErrorCotizaciones(err.response.data.message || `Server Error: ${err.response.status} - ${err.response.statusText}`);
                    if (err.response.status === 401) {
                        console.log("Token inválido o expirado para cotizaciones. Redirigiendo a login...");
                        // Opcional: localStorage.removeItem('token'); // Limpiar token si es inválido
                    }
                } else if (err.request) {
                    setErrorCotizaciones('Network Error: No response from server for cotizaciones. Check if the server is running.');
                } else {
                    setErrorCotizaciones(err.message || 'An unknown error occurred while fetching cotizaciones.');
                }
                setCotizaciones([]);
            } finally {
                setIsLoadingCotizaciones(false);
            }
        };

        fetchCotizaciones();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

    return { cotizaciones, isLoadingCotizaciones, errorCotizaciones };
};

export default useCotizaciones;
