export interface Usuario {
  fotoUrl: string;
  notificaciones: string | null;
  nombre: string;
  apellidoPaterno: string;
  tipo: "Cocina" | "Barra" | "Gerente" | "Mesero";
  estado: "Activo" | "Inactivo";
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  infoUsuario: Usuario;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
