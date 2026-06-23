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
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenService } from '../../services/orden.service';
import { RefaccionService } from '../../services/refaccion.service';
import { OrdenTrabajo, CreateOrdenTrabajoDto, UpdateOrdenTrabajoDto, EstatusOrden } from '../../models/orden-trabajo.model';
import { Refaccion, InventarioMovimientoDto } from '../../models/refaccion.model';
import { LicenciaService } from '../../services/licencia.service';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatSelectModule, MatChipsModule, MatSnackBarModule],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.css'
})
export class OrdenesComponent implements OnInit {
  private service = inject(OrdenService);
  private refaccionService = inject(RefaccionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private licenciaService = inject(LicenciaService);
  readonly EstatusOrdenS = EstatusOrden;

  datos: OrdenTrabajo[] = [];
  refacciones: Refaccion[] = [];
  displayedColumns = ['folio', 'cliente', 'vehiculo', 'estatus', 'total', 'fechaEntrada', 'acciones'];
  loading = false;
  estatusFilter = '';
  readonly estatusOptions = Object.values(EstatusOrden);

  ngOnInit(): void {
    this.cargar();
    this.refaccionService.getAll().subscribe(r => this.refacciones = r);
  }

  cargar(): void {
    this.loading = true;
    const obs = this.estatusFilter ? this.service.getByEstatus(this.estatusFilter as EstatusOrden) : this.service.getAll();
    obs.subscribe({ next: d => { this.datos = d; this.loading = false; }, error: () => { this.loading = false; } });
  }

  filtrarEstatus(): void { this.cargar(); }

  cambiarEstatus(orden: OrdenTrabajo, estatus: EstatusOrden): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    if (estatus === EstatusOrden.Entregada) {
      const dto: UpdateOrdenTrabajoDto = { estatus };
      this.service.update(orden.id, dto).subscribe({
        next: () => { this.snackBar.open('Orden entregada', 'OK', { duration: 3000 }); this.cargar(); },
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
      return;
    }

    const dialogRef = this.dialog.open(MontoDialogComponent, {
      width: '500px',
      data: { estatus, totalActual: orden.total, refacciones: this.refacciones }
    });

    dialogRef.afterClosed().subscribe((result: { monto: number | null; refacciones: { refaccionId: number; cantidad: number; precioUnitario: number }[] } | null) => {
      if (!result) return;
      const dto: UpdateOrdenTrabajoDto = { estatus };
      if (result.monto !== null && result.monto > 0) {
        dto.total = orden.total + result.monto;
      }
      this.service.update(orden.id, dto).subscribe({
        next: () => {
          if (result.refacciones?.length) {
            const movs = result.refacciones.map(r =>
              this.refaccionService.registrarMovimiento({
                refaccionId: r.refaccionId,
                tipoMovimiento: 'Salida',
                cantidad: r.cantidad,
                precioUnitario: r.precioUnitario,
                motivo: `Uso en OT: ${orden.folio}`
              }).toPromise()
            );
            Promise.all(movs).then(() => {
              this.snackBar.open('Estatus actualizado y refacciones descontadas', 'OK', { duration: 3000 });
              this.cargar();
              this.refaccionService.getAll().subscribe(r => this.refacciones = r);
            }).catch(() => {
              this.snackBar.open('Estatus actualizado, error al descontar algunas refacciones', 'OK', { duration: 5000 });
              this.cargar();
            });
          } else {
            this.snackBar.open('Estatus actualizado', 'OK', { duration: 3000 });
            this.cargar();
          }
        },
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    });
  }

  abrirDialogo(orden?: OrdenTrabajo): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    const dialogRef = this.dialog.open(OrdenesDialogComponent, {
      width: '600px',
      data: {
        vehiculoId: orden?.vehiculoId ?? 0,
        clienteId: orden?.clienteId ?? 0,
        empleadoRecibeId: orden?.empleadoRecibeId ?? 0,
        empleadoAsignadoId: orden?.empleadoAsignadoId ?? null,
        fechaPrometida: orden?.fechaPrometida ?? '',
        kilometrajeEntrada: orden?.kilometrajeEntrada ?? 0,
        diagnostico: orden?.diagnostico ?? '',
        observaciones: orden?.observaciones ?? '',
        total: orden?.total ?? 0,
        editando: !!orden
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;
      if (orden) {
        const updateDto: UpdateOrdenTrabajoDto = { diagnostico: result.diagnostico, observaciones: result.observaciones, total: result.total };
        this.service.update(orden.id, updateDto).subscribe({
          next: () => this.cargar(),
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      } else {
        this.service.create(result).subscribe({
          next: () => { this.snackBar.open('Orden creada', 'OK', { duration: 3000 }); this.cargar(); },
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      }
    });
  }

  estatusColor(estatus: EstatusOrden): string {
    const colors: Record<string, string> = { 'Recibida': 'primary', 'Diagnostico': 'accent', 'EnProceso': 'warn', 'EsperaRefacciones': 'warn', 'Terminada': 'primary', 'Entregada': '', 'Cancelada': 'warn' };
    return colors[estatus] || '';
  }

  siguienteEstatus(orden: OrdenTrabajo): EstatusOrden | null {
    const flow: EstatusOrden[] = [EstatusOrden.Recibida, EstatusOrden.Diagnostico, EstatusOrden.EnProceso, EstatusOrden.Terminada, EstatusOrden.Entregada];
    const idx = flow.indexOf(orden.estatus);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  }

  private extraerError(e: HttpErrorResponse): string {
    if (e.error?.errors) { return Object.values(e.error.errors).flat().join('. '); }
    if (e.error?.mensaje) { return e.error.mensaje; }
    return 'Error de servidor';
  }
}

@Component({
  selector: 'app-monto-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSelectModule, MatIconModule, MatTableModule],
  template: `
    <h2 mat-dialog-title>Agregar monto</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="dialog-content">
        <p>¿Deseas agregar un monto al avanzar a <strong>{{ estatus }}</strong>?</p>
        <p>Total actual: <strong>{{ totalActual | currency:'MXN':'symbol':'1.2-2' }}</strong></p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Monto</mat-label>
          <input matInput type="number" formControlName="monto" min="0" step="0.01" placeholder="0.00">
          <span matTextSuffix>MXN</span>
          <mat-error *ngIf="form.get('monto')?.hasError('min')">El monto no puede ser negativo</mat-error>
        </mat-form-field>

        <button mat-stroked-button type="button" color="accent" (click)="toggleRefacciones()" class="btn-refacciones">
          <mat-icon>{{ mostrarRefacciones ? 'expand_less' : 'add' }}</mat-icon>
          {{ mostrarRefacciones ? 'Ocultar refacciones' : 'Incluir refacciones' }}
        </button>

        @if (mostrarRefacciones) {
          <div class="refacciones-section">
            <div class="refaccion-add-row">
              <mat-form-field appearance="outline" class="refaccion-select">
                <mat-label>Refaccion</mat-label>
                <mat-select [(ngModel)]="refaccionSeleccionada" [ngModelOptions]="{standalone: true}">
                  @for (r of refaccionesDisponibles; track r.id) {
                    <mat-option [value]="r">{{ r.nombre }} ({{ r.codigo }}) - {{ r.precioVenta | currency:'MXN':'symbol':'1.2-2' }} | Stock: {{ r.stockActual }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="refaccion-cantidad">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" [(ngModel)]="cantidadSeleccionada" [ngModelOptions]="{standalone: true}" min="1" step="1">
              </mat-form-field>
              <button mat-icon-button color="primary" type="button" (click)="agregarRefaccion()" [disabled]="!refaccionSeleccionada || cantidadSeleccionada < 1" matTooltip="Agregar refaccion">
                <mat-icon>add_circle</mat-icon>
              </button>
            </div>

            @if (refaccionesAgregadas.length > 0) {
              <table mat-table [dataSource]="refaccionesAgregadas" class="refacciones-table">
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Refaccion</th>
                  <td mat-cell *matCellDef="let r">{{ r.nombre }} ({{ r.codigo }})</td>
                </ng-container>
                <ng-container matColumnDef="cantidad">
                  <th mat-header-cell *matHeaderCellDef class="center">Cant.</th>
                  <td mat-cell *matCellDef="let r" class="center">{{ r.cantidad }}</td>
                </ng-container>
                <ng-container matColumnDef="precio">
                  <th mat-header-cell *matHeaderCellDef class="right">P. Unitario</th>
                  <td mat-cell *matCellDef="let r" class="right">{{ r.precioUnitario | currency:'MXN':'symbol':'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="subtotal">
                  <th mat-header-cell *matHeaderCellDef class="right">Subtotal</th>
                  <td mat-cell *matCellDef="let r" class="right">{{ (r.cantidad * r.precioUnitario) | currency:'MXN':'symbol':'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let r; let i = $index">
                    <button mat-icon-button color="warn" type="button" (click)="quitarRefaccion(i)" matTooltip="Quitar">
                      <mat-icon>remove_circle</mat-icon>
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['nombre', 'cantidad', 'precio', 'subtotal', 'acciones']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['nombre', 'cantidad', 'precio', 'subtotal', 'acciones'];"></tr>
              </table>
              <div class="refacciones-total">
                <span>Total refacciones: {{ totalRefacciones | currency:'MXN':'symbol':'1.2-2' }}</span>
              </div>
            }
          </div>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cerrar()">Omitir</button>
        <button mat-raised-button color="primary" type="submit">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    :host { display: block; }
    .full-width { width: 100%; }
    .dialog-content { overflow-y: auto; max-height: 70vh; }
    .btn-refacciones { margin-bottom: 12px; }
    .refacciones-section { margin-top: 8px; display: flex; flex-direction: column; gap: 12px; }
    .refaccion-add-row { display: flex; gap: 8px; align-items: center; }
    .refaccion-select { flex: 3; }
    .refaccion-cantidad { flex: 1; min-width: 70px; }
    .refacciones-table { width: 100%; }
    .center { text-align: center; }
    .right { text-align: right; }
    .refacciones-total { text-align: right; font-weight: 600; font-size: 14px; margin-top: 4px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.12); }
  `]
})
export class MontoDialogComponent {
  form: FormGroup;
  estatus: string;
  totalActual: number;
  refacciones: Refaccion[];
  mostrarRefacciones = false;
  refaccionSeleccionada: Refaccion | null = null;
  cantidadSeleccionada = 1;
  refaccionesAgregadas: { refaccionId: number; nombre: string; codigo: string; cantidad: number; precioUnitario: number }[] = [];
  private ref = inject(MatDialogRef<MontoDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { estatus: EstatusOrden; totalActual: number; refacciones: Refaccion[] };
    this.estatus = data.estatus;
    this.totalActual = data.totalActual;
    this.refacciones = data.refacciones;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      monto: [0, [Validators.min(0)]]
    });
  }

  get refaccionesDisponibles(): Refaccion[] {
    const idsAgregados = new Set(this.refaccionesAgregadas.map(r => r.refaccionId));
    return this.refacciones.filter(r => r.activo && r.stockActual > 0 && !idsAgregados.has(r.id));
  }

  get totalRefacciones(): number {
    return this.refaccionesAgregadas.reduce((sum, r) => sum + r.cantidad * r.precioUnitario, 0);
  }

  toggleRefacciones(): void {
    this.mostrarRefacciones = !this.mostrarRefacciones;
  }

  agregarRefaccion(): void {
    if (!this.refaccionSeleccionada || this.cantidadSeleccionada < 1) return;
    if (this.cantidadSeleccionada > this.refaccionSeleccionada.stockActual) return;
    this.refaccionesAgregadas.push({
      refaccionId: this.refaccionSeleccionada.id,
      nombre: this.refaccionSeleccionada.nombre,
      codigo: this.refaccionSeleccionada.codigo,
      cantidad: this.cantidadSeleccionada,
      precioUnitario: this.refaccionSeleccionada.precioVenta,
    });
    const montoRefacciones = this.totalRefacciones;
    this.form.patchValue({ monto: montoRefacciones });
    this.refaccionSeleccionada = null;
    this.cantidadSeleccionada = 1;
  }

  quitarRefaccion(index: number): void {
    this.refaccionesAgregadas.splice(index, 1);
    const montoRefacciones = this.totalRefacciones;
    this.form.patchValue({ monto: montoRefacciones });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const monto = this.form.value.monto;
    this.ref.close({
      monto: monto > 0 ? monto : null,
      refacciones: this.refaccionesAgregadas
    });
  }

  cerrar(): void {
    this.ref.close(null);
  }
}

@Component({
  selector: 'app-ordenes-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nueva' }} Orden de Trabajo</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Vehiculo ID</mat-label>
          <input matInput type="number" formControlName="vehiculoId" min="1" placeholder="Ej: 1">
          <mat-error *ngIf="form.get('vehiculoId')?.hasError('required')">El vehiculo es obligatorio</mat-error>
          <mat-error *ngIf="form.get('vehiculoId')?.hasError('min')">Ingrese un ID valido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cliente ID</mat-label>
          <input matInput type="number" formControlName="clienteId" min="1" placeholder="Ej: 1">
          <mat-error *ngIf="form.get('clienteId')?.hasError('required')">El cliente es obligatorio</mat-error>
          <mat-error *ngIf="form.get('clienteId')?.hasError('min')">Ingrese un ID valido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Empleado Recibe ID</mat-label>
          <input matInput type="number" formControlName="empleadoRecibeId" min="1" placeholder="Ej: 1">
          <mat-error *ngIf="form.get('empleadoRecibeId')?.hasError('required')">El empleado que recibe es obligatorio</mat-error>
          <mat-error *ngIf="form.get('empleadoRecibeId')?.hasError('min')">Ingrese un ID valido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Empleado Asignado ID</mat-label>
          <input matInput type="number" formControlName="empleadoAsignadoId" min="1" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha Prometida</mat-label>
          <input matInput type="date" formControlName="fechaPrometida" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Kilometraje</mat-label>
          <input matInput type="number" formControlName="kilometrajeEntrada" min="0" placeholder="Opcional">
          <mat-error *ngIf="form.get('kilometrajeEntrada')?.hasError('min')">No puede ser negativo</mat-error>
        </mat-form-field>
        @if (editando) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Total</mat-label>
            <input matInput type="number" formControlName="total" min="0" step="0.01" placeholder="0.00">
            <span matTextSuffix>MXN</span>
            <mat-error *ngIf="form.get('total')?.hasError('required')">El total es obligatorio</mat-error>
            <mat-error *ngIf="form.get('total')?.hasError('min')">No puede ser negativo</mat-error>
          </mat-form-field>
        }
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Diagnostico</mat-label>
          <textarea matInput formControlName="diagnostico" rows="3" placeholder="Opcional"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2" placeholder="Opcional"></textarea>
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
export class OrdenesDialogComponent {
  form: FormGroup;
  editando: boolean;
  private ref = inject(MatDialogRef<OrdenesDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { vehiculoId: number; clienteId: number; empleadoRecibeId: number; empleadoAsignadoId: number | null; fechaPrometida: string; kilometrajeEntrada: number; diagnostico: string; observaciones: string; total: number; editando: boolean };
    this.editando = data.editando;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      vehiculoId: [data.vehiculoId || null, [Validators.required, Validators.min(1)]],
      clienteId: [data.clienteId || null, [Validators.required, Validators.min(1)]],
      empleadoRecibeId: [data.empleadoRecibeId || null, [Validators.required, Validators.min(1)]],
      empleadoAsignadoId: [data.empleadoAsignadoId],
      fechaPrometida: [data.fechaPrometida],
      kilometrajeEntrada: [data.kilometrajeEntrada, [Validators.min(0)]],
      total: [data.total, [Validators.required, Validators.min(0)]],
      diagnostico: [data.diagnostico],
      observaciones: [data.observaciones],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      vehiculoId: v.vehiculoId,
      clienteId: v.clienteId,
      empleadoRecibeId: v.empleadoRecibeId,
      empleadoAsignadoId: v.empleadoAsignadoId ?? undefined,
      fechaPrometida: v.fechaPrometida || undefined,
      kilometrajeEntrada: v.kilometrajeEntrada || undefined,
      diagnostico: v.diagnostico?.trim() || undefined,
      observaciones: v.observaciones?.trim() || undefined,
      total: v.total,
      detalles: [],
    });
  }
}
