import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "../api/authApi";
import { AuthState, LoginResponse } from "../types/auth";

const AUTH_STORAGE_KEY = "@auth_data";

interface AuthContextType extends AuthState {
  signIn:  (correo: string, contraseña: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Cargar datos de autenticación guardados, evitando race conditions tras signOut
  useEffect(() => {
    let isActive = true;
    const loadAuthData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        // Si el efecto fue cancelado (por signOut), no actualizar estado
        if (!isActive) return;
        if (storedData) {
          const parsedData: AuthState = JSON.parse(storedData);
          // Solo hacer login si el token es string válido y no nulo
          if (parsedData.token && typeof parsedData.token === 'string' && parsedData.token !== 'null') {
            setState({
              ...parsedData,
              isLoading: false,
            });
            return;
          }
        }
      } catch (error) {
        if (isActive) {
          console.error("Error loading auth data:", error);
        }
      }
      if (isActive) {
        setState((prev) => ({ ...prev, isLoading: false, token: null, refreshToken: null, user: null, isAuthenticated: false }));
      }
    };
    loadAuthData();
    return () => {
      isActive = false;
    };
  }, []);

  // Iniciar sesión
  const signIn = useCallback(async (correo: string, contraseña: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response: LoginResponse = await authApi.login(correo, contraseña);

      // Debug temporal para verificar que llega el refreshToken
      console.log('=== LOGIN RESPONSE ===');
      console.log('accessToken:', response.accessToken ?  'SÍ' :  'NO');
      console.log('refreshToken:', response.refreshToken ? 'SÍ' : 'NO');
      console.log('======================');

      const newState: AuthState = {
        token: response.accessToken,
        refreshToken: response.refreshToken || null,
        user: response.infoUsuario,
        isAuthenticated: true,
        isLoading: false,
      };

      setState(newState);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Cerrar sesión
  const signOut = useCallback(async () => {
    try {
      // Borra TODO el storage para evitar residuos
      await AsyncStorage.clear();
      setState({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error signing out:", error);
      setState({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Refrescar token
  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.refreshToken) {
        console.log("No hay refresh token disponible");
        await signOut();
        return false;
      }

      console.log("Intentando refrescar token...");
      const response = await authApi.refreshToken(state.refreshToken);

      const newState: AuthState = {
        token: response.accessToken,
        refreshToken: response.refreshToken || state.refreshToken,
        user: response.infoUsuario || state.user,
        isAuthenticated: true,
        isLoading: false,
      };

      setState(newState);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON. stringify(newState));
      
      console.log("Token refrescado exitosamente");
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      await signOut();
      return false;
    }
  }, [state.refreshToken, state.user, signOut]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        refreshAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;