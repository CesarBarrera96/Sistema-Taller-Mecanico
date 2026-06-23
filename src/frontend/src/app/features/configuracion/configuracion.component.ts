import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfiguracionTallerService } from '../../services/configuracion-taller.service';
import { LicenciaService } from '../../services/licencia.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent implements OnInit {
  private service = inject(ConfiguracionTallerService);
  private licenciaService = inject(LicenciaService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  hasLogo = false;
  loading = false;
  saving = false;

  licenciaToken = '';
  activandoLicencia = false;

  readonly whatsappNumber = '528116190278';
  readonly whatsappMessage = encodeURIComponent('Hola, necesito una licencia del Sistema Taller Mecanico. Me podrias proporcionar una clave de activacion?');
  readonly mercadoLibreUrl = 'https://www.mercadolibre.com.mx';

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      rfc: ['', [Validators.maxLength(20)]],
      telefono: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.maxLength(500)]],
      leyendaPiePagina: ['', [Validators.maxLength(300)]],
      nombreImpuesto: ['IVA', [Validators.required, Validators.maxLength(30)]],
      porcentajeImpuesto: [16, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  get savedLogoUrl(): string | null {
    return this.service.logoUrl();
  }

  get licenciaActiva(): boolean {
    return this.licenciaService.licenciaActiva();
  }

  get fechaExpiracionLicencia(): string | null {
    const fecha = this.licenciaService.fechaExpiracion();
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  get diasRestantes(): number | null {
    return this.licenciaService.diasRestantes();
  }

  get minutosRestantes(): number | null {
    return this.licenciaService.minutosRestantes();
  }

  get estadoLicencia(): string {
    return this.licenciaService.estadoLicencia();
  }

  ngOnInit(): void {
    this.loading = true;
    this.service.get().subscribe({
      next: (config) => {
        this.form.patchValue({
          nombre: config.nombre,
          rfc: config.rfc ?? '',
          telefono: config.telefono ?? '',
          direccion: config.direccion ?? '',
          leyendaPiePagina: config.leyendaPiePagina ?? '',
          nombreImpuesto: config.nombreImpuesto ?? 'IVA',
          porcentajeImpuesto: config.porcentajeImpuesto ?? 16
        });
        this.hasLogo = !!config.logoRuta;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.licenciaService.checkStatus().subscribe();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
      reader.readAsDataURL(this.selectedFile!);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    const input = document.getElementById('logoInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  eliminarLogo(): void {
    if (!confirm('Eliminar el logo del taller? Se restaurara el icono predeterminado.')) return;
    this.service.deleteLogo().subscribe({
      next: () => {
        this.hasLogo = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.snackBar.open('Logo eliminado', 'OK', { duration: 3000 });
      },
      error: (e: HttpErrorResponse) => {
        this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 });
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const dto = this.form.value;

    this.service.update(dto).subscribe({
      next: () => {
        if (this.selectedFile) {
          this.service.uploadLogo(this.selectedFile).subscribe({
            next: () => {
              this.saving = false;
              this.hasLogo = true;
              this.selectedFile = null;
              this.previewUrl = null;
              this.snackBar.open('Configuracion guardada', 'OK', { duration: 3000 });
              this.ngOnInit();
            },
            error: (e: HttpErrorResponse) => {
              this.saving = false;
              this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 });
            }
          });
        } else {
          this.saving = false;
          this.snackBar.open('Configuracion guardada', 'OK', { duration: 3000 });
          this.ngOnInit();
        }
      },
      error: (e: HttpErrorResponse) => {
        this.saving = false;
        this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 });
      }
    });
  }

  activarLicencia(): void {
    const token = this.licenciaToken.trim();
    if (!token) {
      this.snackBar.open('Ingrese la clave de activacion', 'OK', { duration: 3000 });
      return;
    }
    this.activandoLicencia = true;
    this.licenciaService.activar(token).subscribe({
      next: (status) => {
        this.activandoLicencia = false;
        this.licenciaToken = '';
        if (status.activa) {
          this.snackBar.open('Licencia activada exitosamente!', 'OK', { duration: 3000 });
        } else {
          this.snackBar.open('La licencia no pudo ser activada', 'OK', { duration: 5000 });
        }
      },
      error: (e: HttpErrorResponse) => {
        this.activandoLicencia = false;
        const msg = e.error?.mensaje || 'Error al activar la licencia';
        this.snackBar.open(msg, 'OK', { duration: 5000 });
      }
    });
  }

  openWhatsapp(): void {
    window.open(`https://wa.me/${this.whatsappNumber}?text=${this.whatsappMessage}`, '_blank');
  }

  openMercadoLibre(): void {
    window.open(this.mercadoLibreUrl, '_blank');
  }

  private extraerError(e: HttpErrorResponse): string {
    if (e.error?.errors) { return Object.values(e.error.errors).flat().join('. '); }
    if (e.error?.mensaje) { return e.error.mensaje; }
    return 'Error de servidor';
  }
}
