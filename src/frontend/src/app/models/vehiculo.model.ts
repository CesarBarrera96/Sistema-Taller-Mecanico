export interface Vehiculo {
  id: number;
  clienteId: number;
  nombreCliente: string;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  placas: string;
  vin?: string;
  kilometraje?: number;
  fechaCreacion: string;
}

export interface CreateVehiculoDto {
  clienteId: number;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  placas: string;
  vin?: string;
  kilometraje?: number;
}

export interface UpdateVehiculoDto extends CreateVehiculoDto {}
