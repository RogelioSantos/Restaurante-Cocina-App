import { API_BASE_URL } from "../constants/api";
import { LoginResponse } from "../types/auth";

// Header para identificar que es una app móvil
const CLIENT_HEADERS = {
  "Content-Type": "application/json",
  "X-Client-Type": "react-native-app",
};

export const authApi = {
    /**
     * Restablece la contraseña usando el token recibido por email
     * @param token Token recibido en el enlace
     * @param password Nueva contraseña
     */
    resetPassword: async (token: string, password: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/password/reset`, {
        method: "POST",
        headers: CLIENT_HEADERS,
        body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo restablecer la contraseña");
      }
      // No retorna nada si es exitoso
    },
  login: async (correo: string, contraseña: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: CLIENT_HEADERS,
      body: JSON.stringify({ correo, contraseña }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    return await response.json();
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?:  string; infoUsuario?: any }> => {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: CLIENT_HEADERS,
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Error al refrescar token");
    }

    return await response.json();
  },

  /**
   * Recuperación de contraseña
   * @param email Correo del usuario
   * @param clientUri URL de la pantalla para cambiar contraseña
   */
  forgotPassword: async (email: string, clientUri: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/password/forgot`, {
        method: "POST",
        headers: CLIENT_HEADERS,
        body: JSON.stringify({ email, clientUri }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al solicitar recuperación de contraseña");
      }
      // No retorna nada si es exitoso
    } catch (error) {
      // Detectar errores de CORS o red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Error de conexión con el servidor. Por favor, verifica tu conexión a internet o contacta al administrador si el problema persiste.");
      }
      // Re-lanzar otros errores
      throw error;
    }
  },
};