import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que esta ruta sea correcta

// Define el estado inicial para las cotizaciones
const initialState = {
    cotizaciones: [], // Un array para almacenar las cotizaciones (listado principal)
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,    // Almacena cualquier mensaje de error
    pagination: {   // Información de paginación para el listado principal
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    },
    // Nuevos estados para los datos del dashboard
    totalCotizaciones: 0, // Para la estadística de total de cotizaciones
    ingresosEstimadosPorMes: [], // Para el gráfico de ingresos por mes
    dashboardStatus: 'idle', // Estado de carga específico para los datos del dashboard
    dashboardError: null,    // Errores específicos del dashboard
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
            return response.data.cotizacion;
        } catch (error) {
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
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/NOVO/cotizaciones', { params });
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
// NUEVOS THUNKS PARA EL DASHBOARD
// =========================================================

// Thunk para obtener el total de cotizaciones
export const fetchTotalCotizaciones = createAsyncThunk(
    'cotizaciones/fetchTotalCotizaciones',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/NOVO/cotizaciones/total');
            return response.data.totalCotizaciones; // Asume que el backend devuelve { totalCotizaciones: X }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error al obtener el total de cotizaciones.');
        }
    }
);

// Thunk para obtener los ingresos estimados por mes
export const fetchIngresosEstimadosPorMes = createAsyncThunk(
    'cotizaciones/fetchIngresosEstimadosPorMes',
    async ({ year, estados }, { rejectWithValue }) => {
        try {
            const params = { year };
            if (estados && estados.length > 0) {
                params.estados = estados.join(','); // Unir el array para el parámetro de consulta
            }
            const response = await axiosInstance.get('/NOVO/cotizaciones/ingresos-por-mes', { params });
            return response.data.data; // Asume que el backend devuelve { data: [...] }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error al obtener ingresos estimados por mes.');
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
        },
        // Nuevo reducer para resetear solo el estado del dashboard
        resetDashboardStatus: (state) => {
            state.dashboardStatus = 'idle';
            state.dashboardError = null;
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
                state.cotizaciones.push(action.payload);
                state.error = null;
            })
            .addCase(createCotizacion.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al crear la cotización.';
            })
            // fetchCotizaciones (listado principal)
            .addCase(fetchCotizaciones.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCotizaciones.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cotizaciones = action.payload.data;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchCotizaciones.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al obtener las cotizaciones.';
                state.pagination = { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false };
            })
            // fetchCotizacionById
            .addCase(fetchCotizacionById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCotizacionById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.cotizaciones.findIndex(c => c.id_cotizacion === action.payload.id_cotizacion);
                if (index !== -1) {
                    state.cotizaciones[index] = action.payload;
                } else {
                    state.cotizaciones.push(action.payload);
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
                state.cotizaciones = state.cotizaciones.filter(cot => cot.id_cotizacion !== action.payload);
                state.error = null;
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteCotizacion.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al eliminar la cotización.';
            })
            // =========================================================
            // Manejo de extraReducers para los NUEVOS THUNKS DEL DASHBOARD
            // =========================================================
            // fetchTotalCotizaciones
            .addCase(fetchTotalCotizaciones.pending, (state) => {
                state.dashboardStatus = 'loading';
                state.dashboardError = null;
            })
            .addCase(fetchTotalCotizaciones.fulfilled, (state, action) => {
                state.dashboardStatus = 'succeeded';
                state.totalCotizaciones = action.payload; // El payload es directamente el número total
                state.dashboardError = null;
            })
            .addCase(fetchTotalCotizaciones.rejected, (state, action) => {
                state.dashboardStatus = 'failed';
                state.dashboardError = action.payload || 'Error al cargar el total de cotizaciones.';
                state.totalCotizaciones = 0; // Resetear a 0 en caso de error
            })
            // fetchIngresosEstimadosPorMes
            .addCase(fetchIngresosEstimadosPorMes.pending, (state) => {
                state.dashboardStatus = 'loading';
                state.dashboardError = null;
            })
            .addCase(fetchIngresosEstimadosPorMes.fulfilled, (state, action) => {
                state.dashboardStatus = 'succeeded';
                state.ingresosEstimadosPorMes = action.payload; // El payload es el array de datos mensuales
                state.dashboardError = null;
            })
            .addCase(fetchIngresosEstimadosPorMes.rejected, (state, action) => {
                state.dashboardStatus = 'failed';
                state.dashboardError = action.payload || 'Error al cargar los ingresos por mes.';
                state.ingresosEstimadosPorMes = []; // Resetear a array vacío en caso de error
            });
    },
});

// Exporta las acciones síncronas generadas por createSlice
export const { resetCotizacionesStatus, clearCotizacionesError, resetDashboardStatus } = cotizacionesSlice.actions;

// Exporta el reducer principal
export default cotizacionesSlice.reducer;

// Selectores (funciones para extraer datos del estado)
export const selectAllCotizaciones = (state) => state.cotizaciones.cotizaciones;
export const selectCotizacionesStatus = (state) => state.cotizaciones.status;
export const selectCotizacionesError = (state) => state.cotizaciones.error;
export const selectCotizacionesPagination = (state) => state.cotizaciones.pagination;

export const selectCotizacionById = (state, cotizacionId) =>
    state.cotizaciones.cotizaciones.find(cot => cot.id_cotizacion === cotizacionId);

// Nuevos selectores para los datos del dashboard
export const selectTotalCotizaciones = (state) => state.cotizaciones.totalCotizaciones;
export const selectIngresosEstimadosPorMes = (state) => state.cotizaciones.ingresosEstimadosPorMes;
export const selectDashboardStatus = (state) => state.cotizaciones.dashboardStatus;
export const selectDashboardError = (state) => state.cotizaciones.dashboardError;
