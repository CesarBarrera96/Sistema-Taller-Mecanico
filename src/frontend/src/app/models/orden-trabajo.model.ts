export interface OrdenTrabajo {
  id: number;
  folio: string;
  vehiculoId: number;
  vehiculoDescripcion: string;
  clienteId: number;
  nombreCliente: string;
  empleadoRecibeId: number;
  nombreRecibe: string;
  empleadoAsignadoId?: number;
  nombreAsignado?: string;
  estatus: EstatusOrden;
  fechaEntrada: string;
  fechaPrometida?: string;
  fechaEntrega?: string;
  kilometrajeEntrada?: number;
  diagnostico?: string;
  observaciones?: string;
  totalManoObra: number;
  totalRefacciones: number;
  total: number;
  detalles: OrdenDetalleDto[];
}

export interface CreateOrdenTrabajoDto {
  vehiculoId: number;
  clienteId: number;
  empleadoRecibeId: number;
  empleadoAsignadoId?: number;
  fechaPrometida?: string;
  kilometrajeEntrada?: number;
  diagnostico?: string;
  observaciones?: string;
  detalles: CreateOrdenDetalleDto[];
}

export interface UpdateOrdenTrabajoDto {
  estatus?: EstatusOrden;
  empleadoAsignadoId?: number;
  fechaPrometida?: string;
  fechaEntrega?: string;
  diagnostico?: string;
  observaciones?: string;
  total?: number;
}

export interface OrdenDetalleDto {
  id: number;
  tipo: string;
  servicioId?: number;
  nombreServicio?: string;
  refaccionId?: number;
  nombreRefaccion?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

export interface CreateOrdenDetalleDto {
  tipo: string;
  servicioId?: number;
  refaccionId?: number;
  cantidad: number;
  notas?: string;
}

export enum EstatusOrden {
  Recibida = 'Recibida',
  Diagnostico = 'Diagnostico',
  EnProceso = 'EnProceso',
  EsperaRefacciones = 'EsperaRefacciones',
  Terminada = 'Terminada',
  Entregada = 'Entregada',
  Cancelada = 'Cancelada'
}
