export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precioManoObra: number;
  activo: boolean;
}

export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  precioManoObra: number;
}

export interface UpdateServicioDto extends CreateServicioDto {
  activo: boolean;
}
