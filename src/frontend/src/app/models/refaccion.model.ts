export interface Refaccion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
}

export interface CreateRefaccionDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
}

export interface UpdateRefaccionDto extends CreateRefaccionDto {
  activo: boolean;
}

export interface InventarioMovimientoDto {
  refaccionId: number;
  tipoMovimiento: string;
  cantidad: number;
  precioUnitario?: number;
  motivo?: string;
}
