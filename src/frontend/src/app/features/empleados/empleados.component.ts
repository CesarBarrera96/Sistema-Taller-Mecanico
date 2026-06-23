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
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../../models/empleado.model';
import { LicenciaService } from '../../services/licencia.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatSlideToggleModule, MatSnackBarModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css'
})
export class EmpleadosComponent implements OnInit {
  private service = inject(EmpleadoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private licenciaService = inject(LicenciaService);

  datos: Empleado[] = [];
  displayedColumns = ['id', 'nombre', 'puesto', 'telefono', 'email', 'activo', 'acciones'];
  loading = false;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.service.getAll().subscribe({ next: d => { this.datos = d; this.loading = false; }, error: () => { this.loading = false; } });
  }

  toggleActivo(empleado: Empleado): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    const dto: UpdateEmpleadoDto = {
      nombre: empleado.nombre,
      apellidoPaterno: empleado.apellidoPaterno,
      apellidoMaterno: empleado.apellidoMaterno ?? undefined,
      puesto: empleado.puesto,
      telefono: empleado.telefono ?? undefined,
      email: empleado.email ?? undefined,
      activo: !empleado.activo
    };
    this.service.update(empleado.id, dto).subscribe({
      next: () => {
        this.snackBar.open(empleado.activo ? 'Empleado desactivado' : 'Empleado activado', 'OK', { duration: 3000 });
        this.cargar();
      },
      error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
    });
  }

  abrirDialogo(empleado?: Empleado): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    const dialogRef = this.dialog.open(EmpleadosDialogComponent, {
      width: '500px',
      data: {
        nombre: empleado?.nombre ?? '',
        apellidoPaterno: empleado?.apellidoPaterno ?? '',
        apellidoMaterno: empleado?.apellidoMaterno ?? '',
        puesto: empleado?.puesto ?? '',
        telefono: empleado?.telefono ?? '',
        email: empleado?.email ?? '',
        activo: empleado?.activo ?? true,
        editando: !!empleado
      }
    });

    dialogRef.afterClosed().subscribe((result: (CreateEmpleadoDto & { activo?: boolean }) | null) => {
      if (!result) return;
      if (empleado) {
        const updateDto: UpdateEmpleadoDto = { ...result, activo: result.activo ?? empleado.activo };
        this.service.update(empleado.id, updateDto).subscribe({
          next: () => this.cargar(),
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      } else {
        this.service.create(result).subscribe({
          next: () => { this.snackBar.open('Empleado creado', 'OK', { duration: 3000 }); this.cargar(); },
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
  selector: 'app-empleados-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSlideToggleModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nuevo' }} Empleado</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="100" placeholder="Ej: Carlos">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
          <mat-error *ngIf="form.get('nombre')?.hasError('maxlength')">Maximo 100 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Apellido Paterno</mat-label>
          <input matInput formControlName="apellidoPaterno" maxlength="100" placeholder="Ej: Ramirez">
          <mat-error *ngIf="form.get('apellidoPaterno')?.hasError('required')">El apellido paterno es obligatorio</mat-error>
          <mat-error *ngIf="form.get('apellidoPaterno')?.hasError('maxlength')">Maximo 100 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Apellido Materno</mat-label>
          <input matInput formControlName="apellidoMaterno" maxlength="100" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Puesto</mat-label>
          <input matInput formControlName="puesto" maxlength="100" placeholder="Ej: Mecanico">
          <mat-error *ngIf="form.get('puesto')?.hasError('required')">El puesto es obligatorio</mat-error>
          <mat-error *ngIf="form.get('puesto')?.hasError('maxlength')">Maximo 100 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefono</mat-label>
          <input matInput formControlName="telefono" maxlength="20" placeholder="Ej: 555-123-4567">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" placeholder="Ej: carlos@taller.com">
          <mat-error *ngIf="form.get('email')?.hasError('email')">Formato de email invalido</mat-error>
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
export class EmpleadosDialogComponent {
  form: FormGroup;
  editando: boolean;
  private ref = inject(MatDialogRef<EmpleadosDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { nombre: string; apellidoPaterno: string; apellidoMaterno: string; puesto: string; telefono: string; email: string; activo: boolean; editando: boolean };
    this.editando = data.editando;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      nombre: [data.nombre, [Validators.required, Validators.maxLength(100)]],
      apellidoPaterno: [data.apellidoPaterno, [Validators.required, Validators.maxLength(100)]],
      apellidoMaterno: [data.apellidoMaterno],
      puesto: [data.puesto, [Validators.required, Validators.maxLength(100)]],
      telefono: [data.telefono],
      email: [data.email, [Validators.email]],
      activo: [data.activo],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      nombre: v.nombre.trim(),
      apellidoPaterno: v.apellidoPaterno.trim(),
      apellidoMaterno: v.apellidoMaterno?.trim() || undefined,
      puesto: v.puesto.trim(),
      telefono: v.telefono?.trim() || undefined,
      email: v.email?.trim() || undefined,
      activo: v.activo,
    });
  }
}
