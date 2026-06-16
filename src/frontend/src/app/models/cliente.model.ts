export interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono: string;
  email?: string;
  direccion?: string;
  rfc?: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface CreateClienteDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  telefono: string;
  email: string | null;
  direccion: string | null;
  rfc: string | null;
}

export interface UpdateClienteDto extends CreateClienteDto {}
