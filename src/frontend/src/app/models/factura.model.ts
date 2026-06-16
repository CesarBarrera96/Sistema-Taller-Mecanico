export interface Factura {
  id: number;
  folio: string;
  ordenTrabajoId: number;
  ordenFolio: string;
  clienteId: number;
  nombreCliente: string;
  fechaFacturacion: string;
  subtotal: number;
  iva: number;
  total: number;
  estatus: EstatusFactura;
  metodoPago?: string;
  fechaPago?: string;
  observaciones?: string;
  detalles: FacturaDetalleDto[];
}

export interface CreateFacturaDto {
  ordenTrabajoId: number;
  metodoPago?: string;
  observaciones?: string;
}

export interface PagarFacturaDto {
  metodoPago: string;
}

export interface UpdateFacturaDto {
  metodoPago?: string;
  observaciones?: string;
  detalles?: UpdateFacturaDetalleDto[];
}

export interface UpdateFacturaDetalleDto {
  id: number;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface FacturaDetalleDto {
  id: number;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export enum EstatusFactura {
  Pendiente = 'Pendiente',
  Pagada = 'Pagada',
  Cancelada = 'Cancelada'
}
