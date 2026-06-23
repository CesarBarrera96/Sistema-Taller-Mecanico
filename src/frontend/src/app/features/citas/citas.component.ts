import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CitaService } from '../../services/cita.service';
import { ClienteService } from '../../services/cliente.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { EmpleadoService } from '../../services/empleado.service';
import { Cita, CreateCitaDto, UpdateCitaDto, EstatusCita } from '../../models/cita.model';
import { Cliente } from '../../models/cliente.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { Empleado } from '../../models/empleado.model';
import { LicenciaService } from '../../services/licencia.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatSelectModule, MatChipsModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit {
  private service = inject(CitaService);
  private clienteService = inject(ClienteService);
  private vehiculoService = inject(VehiculoService);
  private empleadoService = inject(EmpleadoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private licenciaService = inject(LicenciaService);
  readonly EstatusCitaS = EstatusCita;

  datos: Cita[] = [];
  clientes: Cliente[] = [];
  vehiculos: Vehiculo[] = [];
  empleados: Empleado[] = [];
  displayedColumns = ['id', 'cliente', 'vehiculo', 'fechaHora', 'duracionMinutos', 'estatus', 'motivo', 'acciones'];
  loading = false;
  filtroFecha: Date | null = null;
  readonly estatusOptions = Object.values(EstatusCita);

  private fechaPorDefecto(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.cargar();
    this.clienteService.getAll().subscribe(c => this.clientes = c);
    this.vehiculoService.getAll().subscribe(v => this.vehiculos = v);
    this.empleadoService.getAll().subscribe(e => this.empleados = e);
  }

  cargar(): void {
    this.loading = true;
    let obs;
    if (this.filtroFecha) {
      const y = this.filtroFecha.getFullYear();
      const m = String(this.filtroFecha.getMonth() + 1).padStart(2, '0');
      const d = String(this.filtroFecha.getDate()).padStart(2, '0');
      obs = this.service.getByFecha(`${y}-${m}-${d}`);
    } else {
      obs = this.service.getAll();
    }
    obs.subscribe({ next: d => { this.datos = d; this.loading = false; }, error: () => { this.loading = false; } });
  }

  filtrarFecha(): void { this.cargar(); }
  limpiarFiltro(): void { this.filtroFecha = null; this.cargar(); }

  cambiarEstatus(cita: Cita, estatus: EstatusCita): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    const dto: UpdateCitaDto = { estatus };
    this.service.update(cita.id, dto).subscribe({
      next: () => { this.snackBar.open('Estatus actualizado', 'OK', { duration: 3000 }); this.cargar(); },
      error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerErrores(e), 'OK', { duration: 5000 })
    });
  }

  convertirAOrden(cita: Cita): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    if (confirm('¿Convertir esta cita en orden de trabajo?')) {
      this.service.convertirAOrden(cita.id).subscribe({
        next: () => { this.snackBar.open('Orden de trabajo creada', 'OK', { duration: 3000 }); this.cargar(); },
        error: () => this.snackBar.open('Error al convertir', 'OK', { duration: 3000 })
      });
    }
  }

  abrirDialogo(cita?: Cita): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    const dialogRef = this.dialog.open(CitasDialogComponent, {
      width: '500px',
      data: {
        clienteId: cita?.clienteId ?? 0,
        vehiculoId: cita?.vehiculoId ?? 0,
        empleadoId: cita?.empleadoId ?? null,
        fechaHora: cita?.fechaHora ?? this.fechaPorDefecto(),
        duracionMinutos: cita?.duracionMinutos ?? 60,
        motivo: cita?.motivo ?? '',
        observaciones: cita?.observaciones ?? '',
        editando: !!cita,
        clientes: this.clientes,
        vehiculos: this.vehiculos,
        empleados: this.empleados.filter(e => e.activo)
      }
    });

    dialogRef.afterClosed().subscribe((result: CreateCitaDto | null) => {
      if (!result) return;
      if (cita) {
        const updateDto: UpdateCitaDto = { fechaHora: result.fechaHora, duracionMinutos: result.duracionMinutos, motivo: result.motivo, observaciones: result.observaciones };
        this.service.update(cita.id, updateDto).subscribe({
          next: () => this.cargar(),
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerErrores(e), 'OK', { duration: 5000 })
        });
      } else {
        this.service.create(result).subscribe({
          next: () => { this.snackBar.open('Cita creada', 'OK', { duration: 3000 }); this.cargar(); },
          error: (err: HttpErrorResponse) => { this.snackBar.open(this.extraerErrores(err), 'OK', { duration: 5000 }); }
        });
      }
    });
  }

  estatusColor(estatus: EstatusCita): string {
    const colors: Record<string, string> = { 'Programada': 'primary', 'Confirmada': 'accent', 'EnProceso': 'warn', 'Completada': 'primary', 'Cancelada': 'warn' };
    return colors[estatus] || '';
  }

  private extraerErrores(err: HttpErrorResponse): string {
    if (err.error?.errors) { return Object.values(err.error.errors).flat().join('. '); }
    return err.error?.mensaje || 'Error desconocido';
  }
}

@Component({
  selector: 'app-citas-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nueva' }} Cita</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="clienteId">
            @for (c of clientes; track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }} {{ c.apellidoPaterno }}</mat-option>
            }
          </mat-select>
          <mat-error *ngIf="form.get('clienteId')?.hasError('required')">Seleccione un cliente</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Vehiculo</mat-label>
          <mat-select formControlName="vehiculoId">
            @for (v of vehiculos; track v.id) {
              <mat-option [value]="v.id">{{ v.marca }} {{ v.modelo }} ({{ v.placas }})</mat-option>
            }
          </mat-select>
          <mat-error *ngIf="form.get('vehiculoId')?.hasError('required')">Seleccione un vehiculo</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Empleado</mat-label>
          <mat-select formControlName="empleadoId" panelClass="empleado-select-panel">
            <mat-option [value]="null">Sin asignar</mat-option>
            @for (e of empleados; track e.id) {
              <mat-option [value]="e.id">{{ e.nombre }} {{ e.apellidoPaterno }} - {{ e.puesto }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha y Hora</mat-label>
          <input matInput type="datetime-local" formControlName="fechaHora">
          <mat-error *ngIf="form.get('fechaHora')?.hasError('required')">La fecha y hora son obligatorias</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Duracion (minutos)</mat-label>
          <input matInput type="number" formControlName="duracionMinutos" min="1">
          <mat-error *ngIf="form.get('duracionMinutos')?.hasError('required')">La duracion es obligatoria</mat-error>
          <mat-error *ngIf="form.get('duracionMinutos')?.hasError('min')">Minimo 1 minuto</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>
          <input matInput formControlName="motivo" maxlength="500" placeholder="Ej: Cambio de aceite">
          <mat-error *ngIf="form.get('motivo')?.hasError('required')">El motivo es obligatorio</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <input matInput formControlName="observaciones" placeholder="Opcional">
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`:host { display: block; } .full-width { width: 100%; }`]
})
export class CitasDialogComponent {
  form: FormGroup;
  editando: boolean;
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  empleados: Empleado[];
  private ref = inject(MatDialogRef<CitasDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { clienteId: number; vehiculoId: number; empleadoId: number | null; fechaHora: string; duracionMinutos: number; motivo: string; observaciones: string; editando: boolean; clientes: Cliente[]; vehiculos: Vehiculo[]; empleados: Empleado[] };
    this.editando = data.editando;
    this.clientes = data.clientes;
    this.vehiculos = data.vehiculos;
    this.empleados = data.empleados;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      clienteId: [data.clienteId || null, Validators.required],
      vehiculoId: [data.vehiculoId || null, Validators.required],
      empleadoId: [data.empleadoId],
      fechaHora: [data.fechaHora, Validators.required],
      duracionMinutos: [data.duracionMinutos, [Validators.required, Validators.min(1)]],
      motivo: [data.motivo, [Validators.required, Validators.maxLength(500)]],
      observaciones: [data.observaciones],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      clienteId: v.clienteId,
      vehiculoId: v.vehiculoId,
      empleadoId: v.empleadoId ?? undefined,
      fechaHora: v.fechaHora,
      duracionMinutos: v.duracionMinutos,
      motivo: v.motivo?.trim(),
      observaciones: v.observaciones?.trim() || undefined,
    });
  }
}
