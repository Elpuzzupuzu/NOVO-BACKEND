import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_HOOKS || 'http://localhost:3000/NOVO';

const useClients = () => {
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientsError, setClientsError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            setLoadingClients(true);
            setClientsError(null);
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setClientsError('Authentication token not found. Please log in.');
                    setLoadingClients(false);
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/clientes`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // --- THE CORE FIX: map directly over response.data ---
                if (response.data && Array.isArray(response.data)) {
                    const formattedClients = response.data.map(client => ({
                        value: client.id_cliente,
                        label: `${client.nombre} ${client.apellido}`,
                    }));
                    setClients(formattedClients);
                } else {
                    // This else block handles cases where response.data is not an array (unexpected)
                    setClientsError('Unexpected response format for clients data. Expected an array.');
                    console.error('API Response for clients was not an array:', response.data);
                }

            } catch (err) {
                console.error('Error fetching clients:', err);
                if (err.response) {
                    setClientsError(err.response.data.message || `Server Error: ${err.response.status}`);
                } else if (err.request) {
                    setClientsError('Network Error: No response from server.');
                } else {
                    setClientsError(err.message || 'An unknown error occurred.');
                }
            } finally {
                setLoadingClients(false);
            }
        };

        fetchClients();
    }, []);

    return { clients, loadingClients, clientsError };
};

export default useClients;