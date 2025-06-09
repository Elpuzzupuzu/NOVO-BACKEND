// client/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Asegúrate de que esta ruta sea correcta

// La interfaz de tu backend es:
// POST /NOVO/auth/client/login
// POST /NOVO/auth/employee/login

// Thunk para el login de empleados
export const loginEmployee = createAsyncThunk(
  'auth/loginEmployee', // Nombre de la acción
  async (userData, { rejectWithValue }) => {
    try {
      // *** CAMBIO CLAVE AQUÍ: Ruta completa incluyendo '/NOVO/auth' ***
      const response = await axiosInstance.post('/NOVO/auth/empleado/login', userData);
      // Almacena el token y la información del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      return response.data; // Devuelve los datos que se guardarán en el estado
    } catch (error) {
      // Usa rejectWithValue para pasar el mensaje de error del backend al slice
      if (error.response && error.response.data && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para el login de clientes (opcional, si lo vas a usar en esta app)
export const loginClient = createAsyncThunk(
  'auth/loginClient',
  async (userData, { rejectWithValue }) => {
    try {
      // *** CAMBIO CLAVE AQUÍ: Ruta completa incluyendo '/NOVO/auth' ***
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
        state.error = action.payload || 'Error al iniciar sesión.'; // El payload contiene el error del backend
      })
      // Reducers para loginClient (si es necesario)
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