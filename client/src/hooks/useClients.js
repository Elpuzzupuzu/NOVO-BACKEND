// client/src/hooks/useEmpleados.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Define la URL base de la API aquí también para consistencia
const API_BASE_URL = 'http://localhost:3000/NOVO';

const useEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [isLoadingEmpleados, setIsLoadingEmpleados] = useState(true);
    const [errorEmpleados, setErrorEmpleados] = useState(null);

    useEffect(() => {
        const fetchEmpleados = async () => {
            setIsLoadingEmpleados(true);
            setErrorEmpleados(null);
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setErrorEmpleados('Authentication token not found. Please log in.');
                    setIsLoadingEmpleados(false);
                    return; // Detener la ejecución si no hay token
                }

                // El cambio clave: mapear directamente sobre response.data, sin .data anidado
                const empleadosRes = await axios.get(`${API_BASE_URL}/empleados/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                // Asegúrate de que la respuesta tiene la estructura esperada (array directamente en data)
                if (empleadosRes.data && Array.isArray(empleadosRes.data)) {
                    setEmpleados(empleadosRes.data.map(emp => ({
                        id: emp.id_empleado, // Asegúrate de que esta clave sea correcta para el ID del empleado
                        label: `${emp.nombre} ${emp.apellido}` // Asegúrate de que estas claves sean correctas
                    })));
                } else {
                    // Manejar caso donde response.data no es un array (inesperado)
                    console.warn("La respuesta de empleados no tiene el formato esperado (response.data no es un array):", empleadosRes.data);
                    setErrorEmpleados("Formato de datos de empleados inesperado.");
                    setEmpleados([]); // Asegurar que la lista esté vacía
                }
            } catch (err) {
                console.error('Error al cargar empleados:', err);
                if (err.response) {
                    // Errores de respuesta del servidor (ej. 401, 404, 500)
                    setErrorEmpleados(err.response.data.message || `Server Error: ${err.response.status}`);
                } else if (err.request) {
                    // Errores de red (no hay respuesta del servidor)
                    setErrorEmpleados('Network Error: No response from server.');
                } else {
                    // Otros errores (problemas al configurar la solicitud)
                    setErrorEmpleados(err.message || 'An unknown error occurred.');
                }
                setEmpleados([]); // Limpiar empleados en caso de error
            } finally {
                setIsLoadingEmpleados(false);
            }
        };

        fetchEmpleados();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

    return { empleados, isLoadingEmpleados, errorEmpleados };
};

export default useEmpleados;