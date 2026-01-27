import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  organizationId: string | null;
  token: string | null;
  role: string | null;
  permissions: string[];
  userName: string | null;
  userEmail: string | null;
}

// Utilidades para manejar localStorage
const storagePrefix = "app_";
const getStorageItem = (key: string) =>
  localStorage.getItem(`${storagePrefix}${key}`);
const setStorageItem = (key: string, value: string) =>
  localStorage.setItem(`${storagePrefix}${key}`, value);
const removeStorageItem = (key: string) =>
  localStorage.removeItem(`${storagePrefix}${key}`);

// Comprueba si hay datos en localStorage
const storedUserId = getStorageItem("userId");
const storedToken = getStorageItem("token");
const storedRole = getStorageItem("role");

const initialState: AuthState = {
  isAuthenticated: !!storedToken,
  userId: storedUserId,
  organizationId: null,
  token: storedToken,
  role: storedRole,
  permissions: [],
  userName: getStorageItem("userName"),
  userEmail: getStorageItem("userEmail"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        userId: string;
        organizationId: string;
        token: string;
        role: string;
        permissions: string[];
        userName?: string;
        userEmail?: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.organizationId = action.payload.organizationId;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.permissions = action.payload.permissions;
      state.userName = action.payload.userName || null;
      state.userEmail = action.payload.userEmail || null;

      // Guardar los datos en localStorage
      setStorageItem("userId", action.payload.userId);
      setStorageItem("token", action.payload.token);
      setStorageItem("role", action.payload.role);
      if (action.payload.userName) {
        setStorageItem("userName", action.payload.userName);
      }
      if (action.payload.userEmail) {
        setStorageItem("userEmail", action.payload.userEmail);
      }
    },
    setOrganizationId: (state, action: PayloadAction<string>) => {
      state.organizationId = action.payload;
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.organizationId = null;
      state.token = null;
      state.role = null;
      state.permissions = [];
      state.userName = null;
      state.userEmail = null;

      // Eliminar datos de localStorage
      removeStorageItem("userId");
      removeStorageItem("token");
      removeStorageItem("role");
      removeStorageItem("userName");
      removeStorageItem("userEmail");
    },
  },
});

export const { loginSuccess, logout, setOrganizationId, setPermissions } =
  authSlice.actions;
export default authSlice.reducer;
