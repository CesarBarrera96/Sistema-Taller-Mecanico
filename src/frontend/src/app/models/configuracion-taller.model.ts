export interface ConfiguracionTaller {
  id: number;
  nombre: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  leyendaPiePagina?: string;
  logoRuta?: string;
}

export interface UpdateConfiguracionTallerDto {
  nombre: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  leyendaPiePagina?: string;
}
