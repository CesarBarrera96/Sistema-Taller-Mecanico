export interface Cita {
  id: number;
  clienteId: number;
  nombreCliente: string;
  vehiculoId: number;
  vehiculoDescripcion: string;
  empleadoId?: number;
  nombreEmpleado?: string;
  fechaHora: string;
  duracionMinutos: number;
  estatus: EstatusCita;
  motivo: string;
  observaciones?: string;
  ordenTrabajoId?: number;
}

export interface CreateCitaDto {
  clienteId: number;
  vehiculoId: number;
  empleadoId?: number;
  fechaHora: string;
  duracionMinutos: number;
  motivo: string;
  observaciones?: string;
}

export interface UpdateCitaDto {
  empleadoId?: number;
  fechaHora?: string;
  duracionMinutos?: number;
  estatus?: EstatusCita;
  motivo?: string;
  observaciones?: string;
}

export enum EstatusCita {
  Programada = 'Programada',
  Confirmada = 'Confirmada',
  EnProceso = 'EnProceso',
  Completada = 'Completada',
  Cancelada = 'Cancelada'
}
