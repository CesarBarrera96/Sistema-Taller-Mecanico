import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ServicioService } from '../../services/servicio.service';
import { Servicio, CreateServicioDto, UpdateServicioDto } from '../../models/servicio.model';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatSlideToggleModule, MatSnackBarModule],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent implements OnInit {
  private service = inject(ServicioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  datos: Servicio[] = [];
  displayedColumns = ['id', 'nombre', 'descripcion', 'precioManoObra', 'activo', 'acciones'];
  loading = false;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.service.getAll().subscribe({ next: d => { this.datos = d; this.loading = false; }, error: () => { this.loading = false; } });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar este servicio?')) {
      this.service.delete(id).subscribe({
        next: () => this.cargar(),
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    }
  }

  abrirDialogo(servicio?: Servicio): void {
    const dialogRef = this.dialog.open(ServiciosDialogComponent, {
      width: '500px',
      data: {
        nombre: servicio?.nombre ?? '',
        descripcion: servicio?.descripcion ?? '',
        precioManoObra: servicio?.precioManoObra ?? 0,
        activo: servicio?.activo ?? true,
        editando: !!servicio
      }
    });

    dialogRef.afterClosed().subscribe((result: (CreateServicioDto & { activo?: boolean }) | null) => {
      if (!result) return;
      if (servicio) {
        const updateDto: UpdateServicioDto = { nombre: result.nombre, descripcion: result.descripcion, precioManoObra: result.precioManoObra, activo: result.activo ?? true };
        this.service.update(servicio.id, updateDto).subscribe({
          next: () => this.cargar(),
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      } else {
        this.service.create(result).subscribe({
          next: () => { this.snackBar.open('Servicio creado', 'OK', { duration: 3000 }); this.cargar(); },
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      }
    });
  }

  private extraerError(e: HttpErrorResponse): string {
    if (e.error?.errors) { return Object.values(e.error.errors).flat().join('. '); }
    if (e.error?.mensaje) { return e.error.mensaje; }
    return 'Error de servidor';
  }
}

@Component({
  selector: 'app-servicios-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSlideToggleModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nuevo' }} Servicio</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="100" placeholder="Ej: Cambio de aceite">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
          <mat-error *ngIf="form.get('nombre')?.hasError('maxlength')">Maximo 100 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripcion</mat-label>
          <input matInput formControlName="descripcion" maxlength="500" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Precio Mano de Obra</mat-label>
          <input matInput type="number" formControlName="precioManoObra" min="0" step="0.01" placeholder="Ej: 500.00">
          <mat-error *ngIf="form.get('precioManoObra')?.hasError('required')">El precio es obligatorio</mat-error>
          <mat-error *ngIf="form.get('precioManoObra')?.hasError('min')">No puede ser negativo</mat-error>
        </mat-form-field>
        <mat-slide-toggle *ngIf="editando" formControlName="activo" class="full-width">Activo</mat-slide-toggle>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`:host { display: block; } .full-width { width: 100%; }`]
})
export class ServiciosDialogComponent {
  form: FormGroup;
  editando: boolean;
  private ref = inject(MatDialogRef<ServiciosDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { nombre: string; descripcion: string; precioManoObra: number; activo: boolean; editando: boolean };
    this.editando = data.editando;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      nombre: [data.nombre, [Validators.required, Validators.maxLength(100)]],
      descripcion: [data.descripcion],
      precioManoObra: [data.precioManoObra, [Validators.required, Validators.min(0)]],
      activo: [data.activo],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      nombre: v.nombre.trim(),
      descripcion: v.descripcion?.trim() || undefined,
      precioManoObra: v.precioManoObra,
      activo: v.activo,
    });
  }
}
