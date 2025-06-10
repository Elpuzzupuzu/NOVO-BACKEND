// client/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que esta ruta sea correcta

// Thunk para el login de empleados
export const loginEmployee = createAsyncThunk(
  'auth/loginEmployee', // Nombre de la acción
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/NOVO/auth/empleado/login', userData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para el login de clientes
export const loginClient = createAsyncThunk(
  'auth/loginClient',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/NOVO/auth/cliente/login', userData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Función para obtener el estado inicial del usuario desde localStorage
const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      return {
        isAuthenticated: true,
        user: JSON.parse(user),
        token: token,
      };
    }
  } catch (e) {
    console.error("Error al parsear user/token de localStorage", e);
  }
  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...getUserFromLocalStorage(), // Carga el estado inicial del usuario
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Reducers para loginEmployee
    builder
      .addCase(loginEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Error al iniciar sesión.';
      })
      // Reducers para loginClient
      .addCase(loginClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginClient.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Error al iniciar sesión.';
      });
  },
});

export const { logout, clearError } = authSlice.actions; // Exporta las acciones síncronas
export default authSlice.reducer; // Exporta el reducer por defecto

// Exporta los selectores
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.isLoading ? 'loading' : 'idle'; // Asume que isLoading es el estado de carga
export const selectAuthError = (state) => state.auth.error;
