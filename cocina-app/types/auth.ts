export interface UserInfo {
  fotoUrl:  string;
  notificaciones: any | null;
  nombre: string;
  apellidoPaterno: string;
  tipo: string;
  estado: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;  // Ahora debería venir con el header X-Client-Type
  infoUsuario:  UserInfo;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}