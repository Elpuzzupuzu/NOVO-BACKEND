// client/src/hooks/useEmpleados.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Define la URL base de la API para consistencia
const API_BASE_URL = process.env.VITE_APP_API_HOOKS || 'http://localhost:3000/NOVO';

const useEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [isLoadingEmpleados, setIsLoadingEmpleados] = useState(true);
    const [errorEmpleados, setErrorEmpleados] = useState(null);

    useEffect(() => {
        const fetchEmpleados = async () => {
            setIsLoadingEmpleados(true);
            setErrorEmpleados(null);
            try {
                // Obtener el token del localStorage
                const token = localStorage.getItem('token');

                if (!token) {
                    // Si no hay token, establecer un error y detener la ejecución
                    setErrorEmpleados('Authentication token not found. Please log in.');
                    setIsLoadingEmpleados(false);
                    return; 
                }

                // Realizar la solicitud Axios, incluyendo el token en los encabezados
                const empleadosRes = await axios.get(`${API_BASE_URL}/empleados?limit=9999`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                // Asegúrate de que la respuesta tiene la estructura esperada
                // En este caso, según el useClients que sí funciona, asumo que la data viene directamente en response.data
                // Si tu API de empleados aún anida en .data.data, tendríamos que volver a esa estructura.
                // Basado en tu useClients, usaremos directamente empleadosRes.data
                if (empleadosRes.data && Array.isArray(empleadosRes.data)) { // <--- CAMBIO CRÍTICO AQUÍ: employeesRes.data en vez de employeesRes.data.data
                    setEmpleados(empleadosRes.data.map(emp => ({
                        id: emp.id_empleado, // Asegúrate de que este sea el nombre correcto del ID
                        label: `${emp.nombre} ${emp.apellido}` // Asegúrate de que estos sean los nombres correctos
                    })));
                } else {
                    // Manejar caso donde la respuesta no es un array directamente en data
                    console.warn("La respuesta de empleados no tiene el formato esperado (response.data no es un array):", empleadosRes.data);
                    setErrorEmpleados("Formato de datos de empleados inesperado.");
                    setEmpleados([]); 
                }
            } catch (err) {
                console.error('Error al cargar empleados:', err);
                if (err.response) {
                    setErrorEmpleados(err.response.data.message || `Server Error: ${err.response.status} - ${err.response.statusText}`);
                    // Si el error es 401, podrías redirigir al login o limpiar el token
                    if (err.response.status === 401) {
                        console.log("Token inválido o expirado. Redirigiendo a login...");
                        // Opcional: Redirigir al login o limpiar localStorage.removeItem('token');
                    }
                } else if (err.request) {
                    setErrorEmpleados('Network Error: No response from server. Check if the server is running.');
                } else {
                    setErrorEmpleados(err.message || 'An unknown error occurred while fetching employees.');
                }
                setEmpleados([]); 
            } finally {
                setIsLoadingEmpleados(false);
            }
        };

        fetchEmpleados();
    }, []);

    return { empleados, isLoadingEmpleados, errorEmpleados };
};

export default useEmpleados;