import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// ¡CAMBIO CLAVE AQUÍ! Importa tu instancia configurada de Axios
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que la ruta sea correcta

// URL base para las peticiones de trabajos (ajusta si es diferente en tu .env o config)
const TRABAJOS_API_URL = '/NOVO/trabajos'; // Asumiendo que esta es la base de tus rutas

// Define un estado inicial
const initialState = {
    data: [], // Lista de trabajos
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    },
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    selectedTrabajo: null, // Para el trabajo que se está viendo o editando en el modal
};

// Thunk asíncrono para obtener trabajos
export const fetchTrabajos = createAsyncThunk(
    'trabajos/fetchTrabajos',
    async ({ page, limit, searchTerm, estado, empleado_id, cotizacion_id }, { rejectWithValue }) => {
        try {
            const params = { page, limit };
            if (searchTerm) params.searchTerm = searchTerm;
            if (estado) params.estado = estado;
            if (empleado_id) params.empleado_id = empleado_id;
            if (cotizacion_id) params.cotizacion_id = cotizacion_id;

            // ¡CAMBIO CLAVE AQUÍ! Usa axiosInstance
            const response = await axiosInstance.get(TRABAJOS_API_URL, { params });
            // El backend ahora devuelve { data, pagination }
            return response.data;
        } catch (error) {
            let errorMessage = 'Error desconocido al obtener trabajos.';
            if (error.response) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor.';
            } else {
                errorMessage = error.message;
            }
            return rejectWithValue(errorMessage);
        }
    }
);

// Thunk asíncrono para crear un trabajo
export const createTrabajo = createAsyncThunk(
    'trabajos/createTrabajo',
    async (trabajoData, { rejectWithValue }) => {
        try {
            // ¡CAMBIO CLAVE AQUÍ! Usa axiosInstance
            const response = await axiosInstance.post(TRABAJOS_API_URL, trabajoData);
            return response.data.trabajo; // Devuelve el trabajo creado
        } catch (error) {
            let errorMessage = 'Error desconocido al crear el trabajo.';
            if (error.response) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor.';
            } else {
                errorMessage = error.message;
            }
            return rejectWithValue(errorMessage);
        }
    }
);

// Thunk asíncrono para actualizar un trabajo
export const updateTrabajo = createAsyncThunk(
    'trabajos/updateTrabajo',
    async ({ id_trabajo, updateData }, { rejectWithValue }) => {
        try {
            // ¡CAMBIO CLAVE AQUÍ! Usa axiosInstance
            const response = await axiosInstance.put(`${TRABAJOS_API_URL}/${id_trabajo}`, updateData);
            return response.data.trabajo; // Devuelve el trabajo actualizado
        } catch (error) {
            let errorMessage = 'Error desconocido al actualizar el trabajo.';
            if (error.response) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor.';
            } else {
                errorMessage = error.message;
            }
            return rejectWithValue(errorMessage);
        }
    }
);

// Thunk asíncrono para eliminar un trabajo
export const deleteTrabajo = createAsyncThunk(
    'trabajos/deleteTrabajo',
    async (id_trabajo, { rejectWithValue }) => {
        try {
            // ¡CAMBIO CLAVE AQUÍ! Usa axiosInstance
            await axiosInstance.delete(`${TRABAJOS_API_URL}/${id_trabajo}`);
            return id_trabajo; // Devuelve el ID del trabajo eliminado
        } catch (error) {
            let errorMessage = 'Error desconocido al eliminar el trabajo.';
            if (error.response) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor.';
            } else {
                errorMessage = error.message;
            }
            return rejectWithValue(errorMessage);
        }
    }
);


const trabajosSlice = createSlice({
    name: 'trabajos',
    initialState,
    reducers: {
        // Reducer para limpiar el estado de un trabajo seleccionado
        clearSelectedTrabajo(state) {
            state.selectedTrabajo = null;
        },
        // Reducer para establecer un trabajo seleccionado (útil para abrir el modal de edición)
        setSelectedTrabajo(state, action) {
            state.selectedTrabajo = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchTrabajos
            .addCase(fetchTrabajos.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTrabajos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload.data; // Los trabajos
                state.pagination = action.payload.pagination; // La paginación
                state.error = null;
            })
            .addCase(fetchTrabajos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al cargar trabajos.';
            })
            // createTrabajo
            .addCase(createTrabajo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Añade el nuevo trabajo al principio de la lista y actualiza el total
                state.data.unshift(action.payload);
                state.pagination.total += 1;
                // Si la paginación está activa, la lógica de recalculo de totalPages
                // se realizará en la próxima llamada a fetchTrabajos para mantener la coherencia.
                state.error = null;
            })
            .addCase(createTrabajo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al crear trabajo.';
            })
            // updateTrabajo
            .addCase(updateTrabajo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Encuentra y reemplaza el trabajo actualizado
                const index = state.data.findIndex(trabajo => trabajo.id_trabajo === action.payload.id_trabajo);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
                state.error = null;
                // Limpia el trabajo seleccionado si fue el que se actualizó
                if (state.selectedTrabajo && state.selectedTrabajo.id_trabajo === action.payload.id_trabajo) {
                    state.selectedTrabajo = null;
                }
            })
            .addCase(updateTrabajo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al actualizar trabajo.';
            })
            // deleteTrabajo
            .addCase(deleteTrabajo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Filtra el trabajo eliminado de la lista
                state.data = state.data.filter(trabajo => trabajo.id_trabajo !== action.payload);
                state.pagination.total -= 1; // Decrementa el total
                state.error = null;
            })
            .addCase(deleteTrabajo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al eliminar trabajo.';
            });
    },
});

export const { clearSelectedTrabajo, setSelectedTrabajo } = trabajosSlice.actions;

export default trabajosSlice.reducer;