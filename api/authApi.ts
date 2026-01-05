import { LoginResponse } from "../types/auth";
import { API_BASE_URL } from "../constants/api";

export const authApi = {
  login: async (correo: string, contraseña: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "react-native-app",
      },
      body: JSON.stringify({ correo, contraseña }),
    });

    if (!response.ok) throw new Error("Error en credenciales");
    return await response.json();
  },

  refreshToken: async (
    tokenExpirado: string
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "react-native-app",
      },
      body: JSON.stringify({ refreshToken: tokenExpirado }),
    });

    if (!response.ok) throw new Error("Sesión expirada");
    return await response.json();
  },
};
