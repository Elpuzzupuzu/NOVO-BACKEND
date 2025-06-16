// client/src/features/clientes/clientesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que esta ruta sea correcta

// Estado inicial para el slice de clientes
const initialState = {
    clientes: [], // Array para almacenar los clientes
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,    // Almacena cualquier mensaje de error
    // Nuevos estados para paginación y búsqueda
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10, // Límite por defecto para la paginación
    searchTerm: '', // Término de búsqueda
};

// =========================================================
// Thunks asíncronos para interactuar con la API de clientes
// =========================================================

/**
 * Thunk para obtener clientes con búsqueda y paginación.
 * Corresponde a la NUEVA ruta GET /NOVO/clientes/search.
 * @param {object} params - Objeto que puede contener searchTerm, page, limit.
 * @param {string} [params.searchTerm] - Término de búsqueda.
 * @param {number} [params.page] - Número de página.
 * @param {number} [params.limit] - Límite de resultados por página.
 */
export const fetchPaginatedClientes = createAsyncThunk(
    'clientes/fetchPaginatedClientes',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await axiosInstance.get(`/NOVO/clientes/search?${queryParams}`);
            return response.data; // Esto debería contener { data: clientes[], pagination: {} }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al obtener clientes paginados.');
        }
    }
);

/**
 * Thunk para crear un nuevo cliente.
 * Corresponde a la ruta POST /NOVO/clientes/register.
 */
export const createCliente = createAsyncThunk(
    'clientes/createCliente',
    async (clienteData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/NOVO/clientes/register', clienteData);
            return response.data.cliente;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al crear cliente.');
        }
    }
);

/**
 * Thunk para actualizar un cliente.
 * Corresponde a la ruta PUT /NOVO/clientes/:id_cliente.
 */
export const updateCliente = createAsyncThunk(
    'clientes/updateCliente',
    async ({ id_cliente, updateData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/NOVO/clientes/${id_cliente}`, updateData);
            return response.data.cliente;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al actualizar cliente con ID ${id_cliente}.`);
        }
    }
);

/**
 * Thunk para eliminar un cliente.
 * Corresponde a la ruta DELETE /NOVO/clientes/:id_cliente.
 */
export const deleteCliente = createAsyncThunk(
    'clientes/deleteCliente',
    async (id_cliente, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/NOVO/clientes/${id_cliente}`);
            return id_cliente; // Devuelve el ID para eliminarlo del estado local
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al eliminar cliente con ID ${id_cliente}.`);
        }
    }
);


// =========================================================
// Creación del Slice de clientes
// =========================================================
const clientesSlice = createSlice({
    name: 'clientes',
    initialState,
    reducers: {
        // Reducers síncronos para controlar la paginación y búsqueda
        setClientePage: (state, action) => {
            state.currentPage = action.payload;
        },
        setClienteLimit: (state, action) => {
            state.limit = action.payload;
        },
        setClienteSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        // Otros reducers síncronos si son necesarios
        resetClientesStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        },
        clearClientesError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Casos para fetchPaginatedClientes
            .addCase(fetchPaginatedClientes.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPaginatedClientes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.clientes = action.payload.data; // Asigna solo los datos de los clientes
                state.currentPage = action.payload.pagination.page;
                state.totalPages = action.payload.pagination.totalPages;
                state.totalItems = action.payload.pagination.total;
                state.limit = action.payload.pagination.limit; // Sincroniza el límite con el backend
                state.error = null;
            })
            .addCase(fetchPaginatedClientes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al cargar los clientes paginados.';
            })
            // Casos para createCliente
            .addCase(createCliente.pending, (state) => {
                state.status = 'loading'; 
                state.error = null;
            })
            .addCase(createCliente.fulfilled, (state, action) => {
                state.status = 'succeeded'; 
                state.error = null;
                // No actualizamos 'clientes' directamente aquí porque la lista se recargará
                // desde el componente para mantener la paginación/filtros.
            })
            .addCase(createCliente.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al crear el cliente.';
            })
            // Casos para updateCliente
            .addCase(updateCliente.pending, (state) => {
                state.status = 'loading'; 
                state.error = null;
            })
            .addCase(updateCliente.fulfilled, (state, action) => {
                // Si el cliente está en la lista paginada actual, lo actualizamos
                const index = state.clientes.findIndex(cli => cli.id_cliente === action.payload.id_cliente);
                if (index !== -1) {
                    state.clientes[index] = action.payload;
                }
                state.status = 'succeeded'; 
                state.error = null;
            })
            .addCase(updateCliente.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al actualizar el cliente.';
            })
            // Casos para deleteCliente
            .addCase(deleteCliente.pending, (state) => {
                state.status = 'loading'; 
                state.error = null;
            })
            .addCase(deleteCliente.fulfilled, (state, action) => {
                state.clientes = state.clientes.filter(cli => cli.id_cliente !== action.payload);
                state.status = 'succeeded'; 
                state.error = null;
                // La paginación se ajustará al recargar desde el componente.
            })
            .addCase(deleteCliente.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al eliminar el cliente.';
            });
    },
});

// Exporta las acciones síncronas generadas por createSlice
export const { 
    setClientePage, 
    setClienteLimit, 
    setClienteSearchTerm, 
    resetClientesStatus, 
    clearClientesError 
} = clientesSlice.actions;

// Exporta el reducer principal
export default clientesSlice.reducer;

// Selectores para extraer datos del estado de los clientes
export const selectAllClientes = (state) => state.clientes.clientes;
export const selectClientesStatus = (state) => state.clientes.status;
export const selectClientesError = (state) => state.clientes.error;

// Nuevos selectores para paginación y búsqueda
export const selectCurrentClientePage = (state) => state.clientes.currentPage;
export const selectTotalClientePages = (state) => state.clientes.totalPages;
export const selectTotalClientes = (state) => state.clientes.totalItems;
export const selectClienteLimit = (state) => state.clientes.limit;
export const selectClienteSearchTerm = (state) => state.clientes.searchTerm;
