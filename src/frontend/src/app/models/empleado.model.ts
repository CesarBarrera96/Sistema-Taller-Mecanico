export interface Empleado {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  email?: string;
  puesto: string;
  usuarioId?: number;
  activo: boolean;
}

export interface CreateEmpleadoDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  email?: string;
  puesto: string;
}

export interface UpdateEmpleadoDto extends CreateEmpleadoDto {
  activo?: boolean;
}
