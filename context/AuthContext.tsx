import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, Usuario, LoginResponse } from "../types/auth";
import { authApi } from "../api/authApi";

interface AuthContextType extends AuthState {
  signIn: (correo: string, contraseña: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@auth_data";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Cargar datos de autenticación al iniciar
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedData) {
          const authData = JSON.parse(storedData);
          setState({
            token: authData.token,
            refreshToken: authData.refreshToken,
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthData();
  }, []);

  // Persistir datos de autenticación
  const persistAuthData = async (
    token: string,
    refreshToken: string | null,
    user: Usuario
  ) => {
    try {
      const authData = { token, refreshToken, user };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error("Error persisting auth data:", error);
    }
  };

  // Limpiar datos de autenticación
  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const signIn = useCallback(async (correo: string, contraseña: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response: LoginResponse = await authApi.login(correo, contraseña);

      const newState: AuthState = {
        token: response.accessToken,
        refreshToken: response.refreshToken || null,
        user: response.infoUsuario,
        isAuthenticated: true,
        isLoading: false,
      };

      setState(newState);
      await persistAuthData(
        response.accessToken,
        response.refreshToken || null,
        response.infoUsuario
      );
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    await clearAuthData();
  }, []);

  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    if (!state.refreshToken) {
      return false;
    }

    try {
      const response = await authApi.refreshToken(state.refreshToken);

      setState((prev) => ({
        ...prev,
        token: response.accessToken,
        refreshToken: response.refreshToken,
      }));

      if (state.user) {
        await persistAuthData(
          response.accessToken,
          response.refreshToken,
          state.user
        );
      }

      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      await signOut();
      return false;
    }
  }, [state.refreshToken, state.user, signOut]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
