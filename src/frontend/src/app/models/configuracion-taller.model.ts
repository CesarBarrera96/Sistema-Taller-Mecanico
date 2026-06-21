export interface ConfiguracionTaller {
  id: number;
  nombre: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  leyendaPiePagina?: string;
  logoRuta?: string;
  nombreImpuesto: string;
  porcentajeImpuesto: number;
}

export interface UpdateConfiguracionTallerDto {
  nombre: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  leyendaPiePagina?: string;
  nombreImpuesto?: string;
  porcentajeImpuesto?: number;
}
