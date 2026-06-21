import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfiguracionTallerService } from '../../services/configuracion-taller.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent implements OnInit {
  private service = inject(ConfiguracionTallerService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  hasLogo = false;
  loading = false;
  saving = false;

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
    if (!confirm('¿Eliminar el logo del taller? Se restaurara el icono predeterminado.')) return;
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

  private extraerError(e: HttpErrorResponse): string {
    if (e.error?.errors) { return Object.values(e.error.errors).flat().join('. '); }
    if (e.error?.mensaje) { return e.error.mensaje; }
    return 'Error de servidor';
  }
}
