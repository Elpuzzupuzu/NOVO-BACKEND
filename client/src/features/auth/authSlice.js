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

// --- NUEVO Thunk para el registro de clientes ---
export const registerClient = createAsyncThunk(
  'auth/registerClient',
  async (userData, { rejectWithValue }) => {
    try {
      // Esta URL debe coincidir con la ruta que definiste en tu backend para el registro de clientes
      const response = await axiosInstance.post('/NOVO/auth/cliente/register', userData);
      // Por lo general, el registro NO inicia sesión automáticamente.
      // Si quieres auto-login después del registro, el backend debería devolver
      // el token y el user, y tú los almacenarías aquí (como en loginClient).
      // Por ahora, solo devolvemos el mensaje de éxito.
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
    // --- Nuevos estados para el registro ---
    registrationSuccess: false, // Indica si el registro fue exitoso
    registrationMessage: null,  // Mensaje de éxito o error específico del registro
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.registrationSuccess = false; // Resetear al hacer logout
      state.registrationMessage = null;  // Resetear al hacer logout
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
      state.registrationMessage = null; // También limpiar mensajes de registro al limpiar errores
      state.registrationSuccess = false; // Resetear el estado de éxito al limpiar errores
    },
    // Nueva acción para limpiar solo el estado de registro, útil después de mostrar un mensaje
    clearRegistrationStatus: (state) => {
        state.registrationSuccess = false;
        state.registrationMessage = null;
    }
  },
  extraReducers: (builder) => {
    // Reducers para loginEmployee
    builder
      .addCase(loginEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false; // Asegurar que estados de registro se limpian
        state.registrationMessage = null;
      })
      .addCase(loginEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.registrationSuccess = false; // Asegurar que estados de registro se limpian
        state.registrationMessage = null;
      })
      .addCase(loginEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Error al iniciar sesión.';
        state.registrationSuccess = false; // Asegurar que estados de registro se limpian
        state.registrationMessage = null;
      })
      // Reducers para loginClient
      .addCase(loginClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false; // Asegurar que estados de registro se limpian
        state.registrationMessage = null;
      })
      .addCase(loginClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.registrationSuccess = false; // Asegurar que estados de registro se limpian
        state.registrationMessage = null;
      })
      .addCase(loginClient.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Error al iniciar sesión.';
        state.registrationSuccess = false; // Asegurar que estados de registro se limpian
        state.registrationMessage = null;
      })
      // --- Reducers para registerClient (NUEVOS) ---
      .addCase(registerClient.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Limpiar errores previos
        state.registrationSuccess = false; // Resetear estado de éxito
        state.registrationMessage = 'Registrando usuario...'; // Mensaje de carga
      })
      .addCase(registerClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null; // Limpiar cualquier error
        state.registrationSuccess = true; // Indicar éxito
        state.registrationMessage = action.payload.message || 'Registro exitoso. ¡Ahora puedes iniciar sesión!';
        // NO se modifica isAuthenticated, user, o token aquí,
        // ya que el registro no asume auto-login por defecto.
      })
      .addCase(registerClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error en el registro. Inténtalo de nuevo.'; // Establecer error
        state.registrationSuccess = false; // Indicar fallo
        state.registrationMessage = null; // Limpiar mensaje de registro
      });
  },
});

// Exporta las acciones síncronas, incluyendo la nueva para limpiar el estado de registro
export const { logout, clearError, clearRegistrationStatus } = authSlice.actions;
export default authSlice.reducer; // Exporta el reducer por defecto

// Exporta los selectores
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.isLoading ? 'loading' : 'idle';
export const selectAuthError = (state) => state.auth.error;
// --- Nuevos selectores para el estado de registro ---
export const selectRegistrationSuccess = (state) => state.auth.registrationSuccess;
export const selectRegistrationMessage = (state) => state.auth.registrationMessage;