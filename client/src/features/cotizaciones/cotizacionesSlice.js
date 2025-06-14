import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que esta ruta sea correcta

// Define el estado inicial para las cotizaciones
const initialState = {
    cotizaciones: [], // Un array para almacenar las cotizaciones
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,    // Almacena cualquier mensaje de error
    pagination: {   // Nuevo objeto para la información de paginación
        total: 0,
        page: 1,
        limit: 10, // <--- CAMBIO REALIZADO AQUÍ: DE 3 A 10
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    },
};

// =========================================================
// Thunks asíncronos para interactuar con la API usando axiosInstance
// =========================================================

// Thunk para crear una nueva cotización
export const createCotizacion = createAsyncThunk(
    'cotizaciones/createCotizacion',
    async (cotizacionData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/NOVO/cotizaciones', cotizacionData);
            // Asume que el backend devuelve { cotizacion: {...} }
            return response.data.cotizacion;
        } catch (error) {
            // Usa rejectWithValue para pasar el mensaje de error del backend al slice
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido');
        }
    }
);

// Thunk para obtener todas las cotizaciones CON FILTROS Y PAGINACIÓN
export const fetchCotizaciones = createAsyncThunk(
    'cotizaciones/fetchCotizaciones',
    // Acepta un objeto 'params' que puede incluir filtros, page y limit
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/NOVO/cotizaciones', { params });
            // Ahora el backend devuelve { data: [...], pagination: {...} }
            return response.data; // Esto contendrá { data, pagination }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido');
        }
    }
);

// Thunk para obtener una cotización por ID
export const fetchCotizacionById = createAsyncThunk(
    'cotizaciones/fetchCotizacionById',
    async (cotizacionId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/NOVO/cotizaciones/${cotizacionId}`);
            // Asume que el backend devuelve { cotizacion: {...} }
            return response.data.cotizacion;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido');
        }
    }
);

// Thunk para actualizar una cotización (ej. cambiar estado, añadir total)
export const updateCotizacion = createAsyncThunk(
    'cotizaciones/updateCotizacion',
    async ({ cotizacionId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/NOVO/cotizaciones/${cotizacionId}`, updatedData); // O .patch
            return response.data.cotizacion;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido');
        }
    }
);

// Thunk para eliminar una cotización (si es necesario)
export const deleteCotizacion = createAsyncThunk(
    'cotizaciones/deleteCotizacion',
    async (cotizacionId, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/NOVO/cotizaciones/${cotizacionId}`);
            return cotizacionId; // Devuelve el ID para eliminarlo del estado
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido');
        }
    }
);

// =========================================================
// Creación del Slice
// =========================================================
const cotizacionesSlice = createSlice({
    name: 'cotizaciones',
    initialState,
    reducers: {
        // Reducers síncronos si los necesitas (ej. para resetear el estado o limpiar errores)
        resetCotizacionesStatus: (state) => {
            state.status = 'idle';
            state.error = null; // Limpiar el error al resetear el estado
        },
        clearCotizacionesError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // createCotizacion
            .addCase(createCotizacion.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createCotizacion.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cotizaciones.push(action.payload); // Añade la nueva cotización
                state.error = null;
            })
            .addCase(createCotizacion.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al crear la cotización.';
            })
            // fetchCotizaciones
            .addCase(fetchCotizaciones.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCotizaciones.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // ASIGNACIÓN CLAVE AQUÍ: Actualiza tanto las cotizaciones como la información de paginación
                state.cotizaciones = action.payload.data;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchCotizaciones.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al obtener las cotizaciones.';
                // Opcional: Reiniciar paginación a valores por defecto en caso de error
                state.pagination = { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false };
            })
            // fetchCotizacionById
            .addCase(fetchCotizacionById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCotizacionById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Opcional: Actualizar una cotización existente si se obtuvo por ID
                const index = state.cotizaciones.findIndex(c => c.id_cotizacion === action.payload.id_cotizacion);
                if (index !== -1) {
                    state.cotizaciones[index] = action.payload;
                } else {
                    state.cotizaciones.push(action.payload); // Añadir si no existe
                }
                state.error = null;
            })
            .addCase(fetchCotizacionById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al obtener la cotización.';
            })
            // updateCotizacion
            .addCase(updateCotizacion.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateCotizacion.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.cotizaciones.findIndex(cot => cot.id_cotizacion === action.payload.id_cotizacion);
                if (index !== -1) {
                    state.cotizaciones[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateCotizacion.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al actualizar la cotización.';
            })
            // deleteCotizacion
            .addCase(deleteCotizacion.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteCotizacion.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Filtra la cotización eliminada del estado
                state.cotizaciones = state.cotizaciones.filter(cot => cot.id_cotizacion !== action.payload);
                state.error = null;
                // Opcional: ajustar `total` en la paginación si se elimina un elemento
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteCotizacion.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al eliminar la cotización.';
            });
    },
});

// Exporta las acciones síncronas generadas por createSlice
export const { resetCotizacionesStatus, clearCotizacionesError } = cotizacionesSlice.actions;

// Exporta el reducer principal
export default cotizacionesSlice.reducer;

// Selectores (funciones para extraer datos del estado)
export const selectAllCotizaciones = (state) => state.cotizaciones.cotizaciones;
export const selectCotizacionesStatus = (state) => state.cotizaciones.status;
export const selectCotizacionesError = (state) => state.cotizaciones.error;
export const selectCotizacionesPagination = (state) => state.cotizaciones.pagination; // Nuevo selector para la paginación

export const selectCotizacionById = (state, cotizacionId) =>
    state.cotizaciones.cotizaciones.find(cot => cot.id_cotizacion === cotizacionId);