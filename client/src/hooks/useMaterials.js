import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.VITE_APP_API_HOOKS || 'http://localhost:3000/NOVO';

const useMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(true);
    const [materialsError, setMaterialsError] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoadingMaterials(true);
            setMaterialsError(null);
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setMaterialsError('Authentication token not found. Please log in.');
                    setLoadingMaterials(false);
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/materiales`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // --- CORE FIX FOR MATERIALS: map directly over response.data ---
                // And use 'material.nombre' for the label
                if (response.data && Array.isArray(response.data)) {
                    const formattedMaterials = response.data.map(material => ({
                        value: material.id_material,
                        label: material.nombre, // Corrected: use 'nombre' field
                    }));
                    setMaterials(formattedMaterials);
                } else {
                    setMaterialsError('Unexpected response format for materials data. Expected an array.');
                    console.error('API Response for materials was not an array:', response.data);
                }

            } catch (err) {
                console.error('Error fetching materials:', err);
                if (err.response) {
                    setMaterialsError(err.response.data.message || `Server Error: ${err.response.status}`);
                } else if (err.request) {
                    setMaterialsError('Network Error: No response from server.');
                } else {
                    setMaterialsError(err.message || 'An unknown error occurred.');
                }
            } finally {
                setLoadingMaterials(false);
            }
        };

        fetchMaterials();
    }, []);

    return { materials, loadingMaterials, materialsError };
};

export default useMaterials;