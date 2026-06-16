export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  rol: string;
  empleadoId?: number;
}

export enum RolUsuario {
  Admin = 'Admin',
  Mecanico = 'Mecanico',
  Recepcionista = 'Recepcionista'
}
