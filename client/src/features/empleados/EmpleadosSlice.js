import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que esta ruta sea correcta

// Estado inicial para el slice de empleados
const initialState = {
    empleados: [], // Array para almacenar los empleados
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,    // Almacena cualquier mensaje de error
    // Nuevos estados para paginación y búsqueda/filtros
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10, // Límite por defecto para la paginación
    searchTerm: '', // Término de búsqueda
    activoFilter: '', // Filtro por estado activo (cadena vacía para "Todos")
    roleFilter: '', // Filtro por rol (cadena vacía para "Todos")
};

// =========================================================
// Thunks asíncronos para interactuar con la API de empleados
// =========================================================

/**
 * Thunk para obtener todos los empleados (método original, sin paginación/búsqueda).
 * Corresponde a la ruta GET /NOVO/empleados.
 */
export const fetchEmpleados = createAsyncThunk(
    'empleados/fetchEmpleados',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/NOVO/empleados');
            // La respuesta.data ya contendrá foto_perfil_url si el backend lo envía
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al obtener empleados.');
        }
    }
);

/**
 * Thunk para obtener empleados con búsqueda, filtros y paginación.
 * Corresponde a la NUEVA ruta GET /NOVO/empleados/search.
 * @param {object} params - Objeto que puede contener searchTerm, page, limit, activo, role.
 * @param {string} [params.searchTerm] - Término de búsqueda.
 * @param {number} [params.page] - Número de página.
 * @param {number} [params.limit] - Límite de resultados por página.
 * @param {boolean} [params.activo] - Filtro por estado activo.
 * @param {string} [params.role] - Filtro por rol.
 */
export const fetchPaginatedEmpleados = createAsyncThunk(
    'empleados/fetchPaginatedEmpleados',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await axiosInstance.get(`/NOVO/empleados/search?${queryParams}`);
            // response.data.data contendrá foto_perfil_url para cada empleado
            return response.data; // Esto debería contener { data: empleados[], pagination: {} }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al obtener empleados paginados.');
        }
    }
);


/**
 * Thunk para crear un nuevo empleado.
 * Corresponde a la ruta POST /NOVO/empleados.
 * @param {object} empleadoData - Datos del empleado a crear, incluyendo `foto_perfil_url` si se proporciona.
 */
export const createEmpleado = createAsyncThunk(
    'empleados/createEmpleado',
    async (empleadoData, { rejectWithValue }) => {
        try {
            // empleadoData ahora puede incluir foto_perfil_url
            const response = await axiosInstance.post('/NOVO/empleados', empleadoData);
            return response.data.empleado; // El empleado devuelto incluirá foto_perfil_url
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Error de red desconocido al crear empleado.');
        }
    }
);

/**
 * Thunk para obtener un empleado por su ID.
 * Corresponde a la ruta GET /NOVO/empleados/:id_empleado.
 */
export const fetchEmpleadoById = createAsyncThunk(
    'empleados/fetchEmpleadoById',
    async (id_empleado, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/NOVO/empleados/${id_empleado}`);
            // La respuesta.data ya contendrá foto_perfil_url si el backend lo envía
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al obtener empleado con ID ${id_empleado}.`);
        }
    }
);

/**
 * Thunk para actualizar un empleado.
 * Corresponde a la ruta PUT /NOVO/empleados/:id_empleado.
 * @param {object} args - Objeto que contiene `id_empleado` y `updateData`.
 * @param {string} args.id_empleado - El ID del empleado a actualizar.
 * @param {object} args.updateData - Objeto con los datos a actualizar, incluyendo `foto_perfil_url` si se modifica.
 */
export const updateEmpleado = createAsyncThunk(
    'empleados/updateEmpleado',
    async ({ id_empleado, updateData }, { rejectWithValue }) => {
        try {
            // updateData ahora puede incluir foto_perfil_url
            const response = await axiosInstance.put(`/NOVO/empleados/${id_empleado}`, updateData);
            return response.data.empleado; // El empleado devuelto incluirá foto_perfil_url
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al actualizar empleado con ID ${id_empleado}.`);
        }
    }
);

/**
 * Thunk para eliminar un empleado.
 * Corresponde a la ruta DELETE /NOVO/empleados/:id_empleado.
 */
export const deleteEmpleado = createAsyncThunk(
    'empleados/deleteEmpleado',
    async (id_empleado, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/NOVO/empleados/${id_empleado}`);
            return id_empleado; // Devuelve el ID para eliminarlo del estado local
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || `Error de red desconocido al eliminar empleado con ID ${id_empleado}.`);
        }
    }
);


// =========================================================
// Creación del Slice de empleados
// =========================================================
const empleadosSlice = createSlice({
    name: 'empleados',
    initialState,
    reducers: {
        // Reducers síncronos para controlar la paginación y filtros
        setEmpleadoPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setEmpleadoLimit: (state, action) => {
            state.limit = action.payload;
        },
        setEmpleadoSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        setEmpleadoActivoFilter: (state, action) => {
            state.activoFilter = action.payload;
        },
        setEmpleadoRoleFilter: (state, action) => {
            state.roleFilter = action.payload;
        },
        // Otros reducers síncronos
        resetEmpleadosStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        },
        clearEmpleadosError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Casos para fetchEmpleados (el original, sin paginación)
            .addCase(fetchEmpleados.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchEmpleados.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.empleados = action.payload; // Asigna los empleados obtenidos, ya contendrán foto_perfil_url
                // IMPORTANTE: Este thunk no actualiza los datos de paginación
                // porque no los recibe del backend.
                state.error = null;
            })
            .addCase(fetchEmpleados.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al cargar los empleados.';
            })
            // Casos para fetchPaginatedEmpleados (el NUEVO)
            .addCase(fetchPaginatedEmpleados.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPaginatedEmpleados.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.empleados = action.payload.data; // Asigna solo los datos de los empleados, ya contendrán foto_perfil_url
                state.currentPage = action.payload.pagination.page;
                state.totalPages = action.payload.pagination.totalPages;
                state.totalItems = action.payload.pagination.total;
                state.limit = action.payload.pagination.limit; // Sincroniza el límite con el backend
                state.error = null;
            })
            .addCase(fetchPaginatedEmpleados.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al cargar los empleados paginados.';
            })
            // Casos para createEmpleado
            .addCase(createEmpleado.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createEmpleado.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                // No actualizamos 'empleados' directamente aquí porque la lista se recargará
                // desde el componente para mantener la paginación/filtros.
                // Sin embargo, si decides agregar el empleado recién creado a la lista,
                // asegúrate de que el 'action.payload' (el nuevo empleado) contenga 'foto_perfil_url'.
                // state.empleados.push(action.payload); // Ejemplo si decides añadirlo
            })
            .addCase(createEmpleado.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al crear el empleado.';
            })
            // Casos para fetchEmpleadoById
            .addCase(fetchEmpleadoById.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchEmpleadoById.fulfilled, (state, action) => {
                // Si el empleado ya está en la lista paginada, lo actualizamos.
                // action.payload (el empleado obtenido) ahora puede incluir foto_perfil_url.
                const index = state.empleados.findIndex(emp => emp.id_empleado === action.payload.id_empleado);
                if (index !== -1) {
                    state.empleados[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(fetchEmpleadoById.rejected, (state, action) => {
                state.error = action.payload || 'Fallo al obtener el empleado por ID.';
            })
            // Casos para updateEmpleado
            .addCase(updateEmpleado.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateEmpleado.fulfilled, (state, action) => {
                // Si el empleado está en la lista paginada actual, lo actualizamos
                // action.payload (el empleado actualizado) ahora puede incluir foto_perfil_url.
                const index = state.empleados.findIndex(emp => emp.id_empleado === action.payload.id_empleado);
                if (index !== -1) {
                    state.empleados[index] = action.payload;
                }
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(updateEmpleado.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al actualizar el empleado.';
            })
            // Casos para deleteEmpleado
            .addCase(deleteEmpleado.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteEmpleado.fulfilled, (state, action) => {
                state.empleados = state.empleados.filter(emp => emp.id_empleado !== action.payload);
                state.status = 'succeeded';
                state.error = null;
                // La paginación se ajustará al recargar desde el componente.
            })
            .addCase(deleteEmpleado.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al eliminar el empleado.';
            });
    },
});

// Exporta las acciones síncronas generadas por createSlice
export const {
    setEmpleadoPage,
    setEmpleadoLimit,
    setEmpleadoSearchTerm,
    setEmpleadoActivoFilter,
    setEmpleadoRoleFilter,
    resetEmpleadosStatus,
    clearEmpleadosError
} = empleadosSlice.actions;

// Exporta el reducer principal
export default empleadosSlice.reducer;

// Selectores para extraer datos del estado de los empleados
export const selectAllEmpleados = (state) => state.empleados.empleados;
export const selectEmpleadosStatus = (state) => state.empleados.status;
export const selectEmpleadosError = (state) => state.empleados.error;
export const selectEmpleadoById = (state, empleadoId) =>
    state.empleados.empleados.find(empleado => empleado.id_empleado === empleadoId);

// Nuevos selectores para paginación y filtros
export const selectCurrentEmpleadoPage = (state) => state.empleados.currentPage;
export const selectTotalEmpleadoPages = (state) => state.empleados.totalPages;
export const selectTotalEmpleados = (state) => state.empleados.totalItems;
export const selectEmpleadoLimit = (state) => state.empleados.limit;
export const selectEmpleadoSearchTerm = (state) => state.empleados.searchTerm;
export const selectEmpleadoActivoFilter = (state) => state.empleados.activoFilter;
export const selectEmpleadoRoleFilter = (state) => state.empleados.roleFilter;