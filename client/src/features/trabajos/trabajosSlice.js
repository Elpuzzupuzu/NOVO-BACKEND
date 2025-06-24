import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que la ruta sea correcta

const TRABAJOS_API_URL = '/NOVO/trabajos';

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
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed' (para listado principal)
    error: null,
    selectedTrabajo: null, // Para el trabajo que se está viendo o editando en el modal

    // Estados para los datos del dashboard de trabajos
    totalTrabajosActivos: 0,
    totalTrabajosCompletados: 0, // Nuevo estado para el conteo de trabajos completados
    trabajosDashboardStatus: 'idle', // Estado de carga específico para los datos del dashboard de trabajos
    trabajosDashboardError: null,    // Errores específicos del dashboard de trabajos
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

            const response = await axiosInstance.get(TRABAJOS_API_URL, { params });
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
            const response = await axiosInstance.post(TRABAJOS_API_URL, trabajoData);
            return response.data.trabajo;
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
            const response = await axiosInstance.put(`${TRABAJOS_API_URL}/${id_trabajo}`, updateData);
            return response.data.trabajo;
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
            await axiosInstance.delete(`${TRABAJOS_API_URL}/${id_trabajo}`);
            return id_trabajo;
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

// =========================================================
// NUEVOS THUNKS PARA EL DASHBOARD
// =========================================================

// Thunk para obtener el número total de trabajos activos
export const fetchTotalTrabajosActivos = createAsyncThunk(
    'trabajos/fetchTotalTrabajosActivos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${TRABAJOS_API_URL}/activos-count`);
            return response.data.totalTrabajosActivos;
        } catch (error) {
            let errorMessage = 'Error al obtener el total de trabajos activos.';
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

// Thunk para obtener el número total de trabajos completados
export const fetchTotalTrabajosCompletados = createAsyncThunk(
    'trabajos/fetchTotalTrabajosCompletados',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${TRABAJOS_API_URL}/completados-count`);
            return response.data.totalTrabajosCompletados; // Asume que el backend devuelve { totalTrabajosCompletados: X }
        } catch (error) {
            let errorMessage = 'Error al obtener el total de trabajos completados.';
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
        clearSelectedTrabajo(state) {
            state.selectedTrabajo = null;
        },
        setSelectedTrabajo(state, action) {
            state.selectedTrabajo = action.payload;
        },
        resetTrabajosDashboardStatus: (state) => {
            state.trabajosDashboardStatus = 'idle';
            state.trabajosDashboardError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchTrabajos
            .addCase(fetchTrabajos.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTrabajos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchTrabajos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al cargar trabajos.';
            })
            // createTrabajo
            .addCase(createTrabajo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data.unshift(action.payload);
                state.pagination.total += 1;
                state.error = null;
            })
            .addCase(createTrabajo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al crear trabajo.';
            })
            // updateTrabajo
            .addCase(updateTrabajo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.data.findIndex(trabajo => trabajo.id_trabajo === action.payload.id_trabajo);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
                state.error = null;
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
                state.data = state.data.filter(trabajo => trabajo.id_trabajo !== action.payload);
                state.pagination.total -= 1;
                state.error = null;
            })
            .addCase(deleteTrabajo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al eliminar trabajo.';
            })
            // =========================================================
            // Manejo de extraReducers para los NUEVOS THUNKS DEL DASHBOARD
            // =========================================================
            // fetchTotalTrabajosActivos
            .addCase(fetchTotalTrabajosActivos.pending, (state) => {
                state.trabajosDashboardStatus = 'loading';
                state.trabajosDashboardError = null;
            })
            .addCase(fetchTotalTrabajosActivos.fulfilled, (state, action) => {
                state.trabajosDashboardStatus = 'succeeded';
                state.totalTrabajosActivos = action.payload;
                state.trabajosDashboardError = null;
            })
            .addCase(fetchTotalTrabajosActivos.rejected, (state, action) => {
                state.trabajosDashboardStatus = 'failed';
                state.trabajosDashboardError = action.payload || 'Error al cargar el total de trabajos activos.';
                state.totalTrabajosActivos = 0;
            })
            // fetchTotalTrabajosCompletados (NUEVO)
            .addCase(fetchTotalTrabajosCompletados.pending, (state) => {
                state.trabajosDashboardStatus = 'loading'; // Compartimos el estado de carga del dashboard
                state.trabajosDashboardError = null;
            })
            .addCase(fetchTotalTrabajosCompletados.fulfilled, (state, action) => {
                state.trabajosDashboardStatus = 'succeeded';
                state.totalTrabajosCompletados = action.payload; // El payload es el número total
                state.trabajosDashboardError = null;
            })
            .addCase(fetchTotalTrabajosCompletados.rejected, (state, action) => {
                state.trabajosDashboardStatus = 'failed';
                state.trabajosDashboardError = action.payload || 'Error al cargar el total de trabajos completados.';
                state.totalTrabajosCompletados = 0;
            });
    },
});

export const { clearSelectedTrabajo, setSelectedTrabajo, resetTrabajosDashboardStatus } = trabajosSlice.actions;

export default trabajosSlice.reducer;

// Selectores
export const selectAllTrabajos = (state) => state.trabajos.data;
export const selectTrabajosStatus = (state) => state.trabajos.status;
export const selectTrabajosError = (state) => state.trabajos.error;
export const selectTrabajosPagination = (state) => state.trabajos.pagination;
export const selectSelectedTrabajo = (state) => state.trabajos.selectedTrabajo;

// Selectores para los datos del dashboard de trabajos
export const selectTotalTrabajosActivos = (state) => state.trabajos.totalTrabajosActivos;
export const selectTotalTrabajosCompletados = (state) => state.trabajos.totalTrabajosCompletados; // Nuevo selector
export const selectTrabajosDashboardStatus = (state) => state.trabajos.trabajosDashboardStatus;
export const selectTrabajosDashboardError = (state) => state.trabajos.trabajosDashboardError;
