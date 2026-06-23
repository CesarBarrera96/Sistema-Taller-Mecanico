export interface LicenciaStatus {
  activa: boolean;
  estado: 'Activa' | 'Vencida' | 'RelojAtrasado';
  fechaExpiracion: string | null;
  diasRestantes: number | null;
  minutosRestantes: number | null;
}

export interface ActivarLicenciaDto {
  token: string;
}
