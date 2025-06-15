// client/src/features/materials/materialsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que esta ruta sea correcta

// Estado inicial para el slice de materiales
const initialState = {
    materials: [], // Array para almacenar los materiales
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,    // Almacena cualquier mensaje de error
    // Nuevos estados para paginación y búsqueda
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10, // Límite por defecto
};

// =========================================================
// Thunks asíncronos para interactuar con la API de materiales
// =========================================================

/**
 * Thunk para obtener todos los materiales.
 * Corresponde a la ruta GET /NOVO/materiales.
 * Este thunk NO tiene paginación ni búsqueda.
 */
export const fetchMaterials = createAsyncThunk(
    'materials/fetchMaterials',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/NOVO/materiales');
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al obtener materiales.');
        }
    }
);

/**
 * Thunk para obtener materiales con búsqueda y paginación.
 * Corresponde a la NUEVA ruta GET /NOVO/materiales/search.
 * @param {object} params - Objeto que puede contener searchTerm, page, limit.
 * @param {string} [params.searchTerm] - Término de búsqueda.
 * @param {number} [params.page] - Número de página.
 * @param {number} [params.limit] - Límite de resultados por página.
 * @param {boolean} [params.disponible_para_cotizacion] - Filtro por disponibilidad.
 */
export const fetchPaginatedMaterials = createAsyncThunk(
    'materials/fetchPaginatedMaterials',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await axiosInstance.get(`/NOVO/materiales/search?${queryParams}`);
            return response.data; // Esto debería contener { data: materials[], pagination: {} }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al obtener materiales paginados.');
        }
    }
);

/**
 * Thunk para crear un nuevo material.
 * Corresponde a la ruta POST /NOVO/materiales.
 */
export const createMaterial = createAsyncThunk(
    'materials/createMaterial',
    async (materialData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/NOVO/materiales', materialData);
            return response.data.material;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al crear material.');
        }
    }
);

/**
 * Thunk para obtener un material por su ID.
 * Corresponde a la ruta GET /NOVO/materiales/:id_material.
 */
export const fetchMaterialById = createAsyncThunk(
    'materials/fetchMaterialById',
    async (id_material, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/NOVO/materiales/${id_material}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al obtener material con ID ${id_material}.`);
        }
    }
);

/**
 * Thunk para actualizar un material.
 * Corresponde a la ruta PUT /NOVO/materiales/:id_material.
 */
export const updateMaterial = createAsyncThunk(
    'materials/updateMaterial',
    async ({ id_material, updateData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/NOVO/materiales/${id_material}`, updateData);
            return response.data.material;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al actualizar material con ID ${id_material}.`);
        }
    }
);

/**
 * Thunk para eliminar un material.
 * Corresponde a la ruta DELETE /NOVO/materiales/:id_material.
 */
export const deleteMaterial = createAsyncThunk(
    'materials/deleteMaterial',
    async (id_material, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/NOVO/materiales/${id_material}`);
            return id_material; // Devuelve el ID para eliminarlo del estado local
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al eliminar material con ID ${id_material}.`);
        }
    }
);


// =========================================================
// Creación del Slice de materiales
// =========================================================
const materialsSlice = createSlice({
    name: 'materials',
    initialState,
    reducers: {
        // Reducers síncronos si son necesarios (ej. para resetear el estado o limpiar errores)
        resetMaterialsStatus: (state) => {
            // CAMBIO CLAVE AQUÍ:
            // Si el estado ya es 'succeeded', no lo volvemos a 'idle' para evitar el re-fetch.
            // Si no está 'succeeded' (ej. 'failed' o 'loading' antes de un fetch inicial),
            // entonces sí lo podemos poner a 'idle' para que el useEffect intente el fetch.
            if (state.status !== 'succeeded') {
                state.status = 'idle';
            }
            state.error = null;
        },
        clearMaterialsError: (state) => {
            state.error = null;
        },
        setMaterialPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setMaterialLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Casos para fetchMaterials (el original, sin paginación)
            .addCase(fetchMaterials.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchMaterials.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.materials = action.payload; // Asigna los materiales obtenidos
                // IMPORTANTE: Este thunk no actualiza los datos de paginación
                // porque no los recibe del backend.
                state.error = null;
            })
            .addCase(fetchMaterials.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al cargar los materiales.';
            })
            // Casos para fetchPaginatedMaterials (el NUEVO)
            .addCase(fetchPaginatedMaterials.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPaginatedMaterials.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.materials = action.payload.data; // Asigna solo los datos de los materiales
                state.currentPage = action.payload.pagination.page;
                state.totalPages = action.payload.pagination.totalPages;
                state.totalItems = action.payload.pagination.total;
                state.limit = action.payload.pagination.limit; // Actualiza el límite en el estado
                state.error = null;
            })
            .addCase(fetchPaginatedMaterials.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al cargar los materiales paginados.';
            })
            // Casos para createMaterial
            .addCase(createMaterial.pending, (state) => {
                state.status = 'loading'; // Puedes cambiar a 'succeeded' si no quieres que el loading interfiera con el fetch inicial
                state.error = null;
            })
            .addCase(createMaterial.fulfilled, (state, action) => {
                // Al crear un material, podríamos querer refetch o insertarlo si estamos en la primera página
                // Por simplicidad, si la creación es exitosa, se puede refetch para asegurar la consistencia.
                // state.materials.push(action.payload); // Si lo añades, considera el impacto en paginación
                state.status = 'succeeded'; // Asegura que el status vuelva a 'succeeded' después de la creación
                state.error = null;
            })
            .addCase(createMaterial.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al crear el material.';
            })
            // Casos para fetchMaterialById - Ajustados para no cambiar el status global de la lista
            .addCase(fetchMaterialById.pending, (state) => {
                // Si este fetch es solo para el modal, no debería cambiar el status general de la lista.
                // Si lo necesitas para un indicador de carga en el modal, manéjalo a nivel de componente o con un estado separado.
                state.error = null; // Limpia el error, pero no cambia 'status'
            })
            .addCase(fetchMaterialById.fulfilled, (state, action) => {
                // Similar al 'pending', no cambia el 'status' general de la lista
                const index = state.materials.findIndex(mat => mat.id_material === action.payload.id_material);
                if (index !== -1) {
                    state.materials[index] = action.payload;
                } else {
                    // Si un material se obtiene por ID y no estaba en la lista, lo añade
                    // Esto puede ser problemático con paginación, considerar refetching total.
                    // state.materials.push(action.payload);
                }
                state.error = null;
            })
            .addCase(fetchMaterialById.rejected, (state, action) => {
                // Similar al 'pending', no cambia el 'status' general de la lista
                state.error = action.payload || 'Fallo al obtener el material por ID.';
            })
            // Casos para updateMaterial
            .addCase(updateMaterial.pending, (state) => {
                state.status = 'loading'; // Puedes cambiar a 'succeeded'
                state.error = null;
            })
            .addCase(updateMaterial.fulfilled, (state, action) => {
                const index = state.materials.findIndex(mat => mat.id_material === action.payload.id_material);
                if (index !== -1) {
                    state.materials[index] = action.payload;
                }
                state.status = 'succeeded'; // Asegura que el status vuelva a 'succeeded' después de la actualización
                state.error = null;
            })
            .addCase(updateMaterial.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al actualizar el material.';
            })
            // Casos para deleteMaterial
            .addCase(deleteMaterial.pending, (state) => {
                state.status = 'loading'; // Puedes cambiar a 'succeeded'
                state.error = null;
            })
            .addCase(deleteMaterial.fulfilled, (state, action) => {
                state.materials = state.materials.filter(mat => mat.id_material !== action.payload);
                state.status = 'succeeded'; // Asegura que el status vuelva a 'succeeded' después de la eliminación
                state.error = null;
            })
            .addCase(deleteMaterial.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al eliminar el material.';
            });
    },
});

// Exporta las acciones síncronas generadas por createSlice
export const { resetMaterialsStatus, clearMaterialsError, setMaterialPage, setMaterialLimit } = materialsSlice.actions;

// Exporta el reducer principal
export default materialsSlice.reducer;

// Selectores para extraer datos del estado de los materiales
export const selectAllMaterials = (state) => state.materials.materials;
export const selectMaterialsStatus = (state) => state.materials.status;
export const selectMaterialsError = (state) => state.materials.error;
export const selectMaterialById = (state, materialId) =>
    state.materials.materials.find(material => material.id_material === materialId);

// Nuevos selectores para paginación
export const selectCurrentPage = (state) => state.materials.currentPage;
export const selectTotalPages = (state) => state.materials.totalPages;
export const selectTotalItems = (state) => state.materials.totalItems;
export const selectLimit = (state) => state.materials.limit;
