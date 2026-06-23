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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { RefaccionService } from '../../services/refaccion.service';
import { Refaccion, CreateRefaccionDto, UpdateRefaccionDto, InventarioMovimientoDto } from '../../models/refaccion.model';
import { LicenciaService } from '../../services/licencia.service';

@Component({
  selector: 'app-refacciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatSlideToggleModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './refacciones.component.html',
  styleUrl: './refacciones.component.css'
})
export class RefaccionesComponent implements OnInit {
  private service = inject(RefaccionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private licenciaService = inject(LicenciaService);

  datos: Refaccion[] = [];
  displayedColumns = ['id', 'codigo', 'nombre', 'precioVenta', 'stockActual', 'stockMinimo', 'activo', 'acciones'];
  loading = false;
  filtroStockBajo = false;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    const obs = this.filtroStockBajo ? this.service.getStockBajo() : this.service.getAll();
    obs.subscribe({ next: d => { this.datos = d; this.loading = false; }, error: () => { this.loading = false; } });
  }

  toggleStockBajo(): void { this.filtroStockBajo = !this.filtroStockBajo; this.cargar(); }

  abrirDialogo(refaccion?: Refaccion): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    const dialogRef = this.dialog.open(RefaccionesDialogComponent, {
      width: '500px',
      data: {
        codigo: refaccion?.codigo ?? '',
        nombre: refaccion?.nombre ?? '',
        descripcion: refaccion?.descripcion ?? '',
        precioCompra: refaccion?.precioCompra ?? 0,
        precioVenta: refaccion?.precioVenta ?? 0,
        stockActual: refaccion?.stockActual ?? 0,
        stockMinimo: refaccion?.stockMinimo ?? 5,
        activo: refaccion?.activo ?? true,
        editando: !!refaccion
      }
    });

    dialogRef.afterClosed().subscribe((result: (CreateRefaccionDto & { activo?: boolean }) | null) => {
      if (!result) return;
      if (refaccion) {
        const updateDto: UpdateRefaccionDto = { ...result, activo: result.activo ?? true };
        this.service.update(refaccion.id, updateDto).subscribe({
          next: () => this.cargar(),
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      } else {
        this.service.create(result).subscribe({
          next: () => { this.snackBar.open('Refaccion creada', 'OK', { duration: 3000 }); this.cargar(); },
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      }
    });
  }

  abrirMovimiento(refaccion: Refaccion): void {
    if (!this.licenciaService.canWrite()) { this.licenciaService.showLicenciaExpiredDialog(); return; }
    const dialogRef = this.dialog.open(MovimientoDialogComponent, {
      width: '450px',
      data: {
        refaccionId: refaccion.id,
        tipoMovimiento: 'Entrada',
        cantidad: 1,
        precioUnitario: refaccion.precioCompra,
        motivo: '',
        refaccionNombre: refaccion.nombre,
        precioCompra: refaccion.precioCompra,
        precioVenta: refaccion.precioVenta
      }
    });

    dialogRef.afterClosed().subscribe((result: InventarioMovimientoDto | null) => {
      if (!result) return;
      this.service.registrarMovimiento(result).subscribe({
        next: () => { this.snackBar.open('Movimiento registrado', 'OK', { duration: 3000 }); this.cargar(); },
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    });
  }

  private extraerError(e: HttpErrorResponse): string {
    if (e.error?.errors) { return Object.values(e.error.errors).flat().join('. '); }
    if (e.error?.mensaje) { return e.error.mensaje; }
    return 'Error de servidor';
  }
}

@Component({
  selector: 'app-refacciones-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSlideToggleModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nueva' }} Refaccion</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Codigo</mat-label>
          <input matInput formControlName="codigo" maxlength="50" placeholder="Ej: FIL-001">
          <mat-error *ngIf="form.get('codigo')?.hasError('required')">El codigo es obligatorio</mat-error>
          <mat-error *ngIf="form.get('codigo')?.hasError('maxlength')">Maximo 50 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="200" placeholder="Ej: Filtro de aceite">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
          <mat-error *ngIf="form.get('nombre')?.hasError('maxlength')">Maximo 200 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripcion</mat-label>
          <input matInput formControlName="descripcion" maxlength="500" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Precio Compra</mat-label>
          <input matInput type="number" formControlName="precioCompra" min="0" step="0.01" placeholder="Ej: 150.00">
          <mat-error *ngIf="form.get('precioCompra')?.hasError('required')">El precio de compra es obligatorio</mat-error>
          <mat-error *ngIf="form.get('precioCompra')?.hasError('min')">No puede ser negativo</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Precio Venta</mat-label>
          <input matInput type="number" formControlName="precioVenta" min="0" step="0.01" placeholder="Ej: 250.00">
          <mat-error *ngIf="form.get('precioVenta')?.hasError('required')">El precio de venta es obligatorio</mat-error>
          <mat-error *ngIf="form.get('precioVenta')?.hasError('min')">No puede ser negativo</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Stock Actual</mat-label>
          <input matInput type="number" formControlName="stockActual" min="0" placeholder="Ej: 10">
          <mat-error *ngIf="form.get('stockActual')?.hasError('required')">El stock actual es obligatorio</mat-error>
          <mat-error *ngIf="form.get('stockActual')?.hasError('min')">No puede ser negativo</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Stock Minimo</mat-label>
          <input matInput type="number" formControlName="stockMinimo" min="0" placeholder="Ej: 5">
          <mat-error *ngIf="form.get('stockMinimo')?.hasError('required')">El stock minimo es obligatorio</mat-error>
          <mat-error *ngIf="form.get('stockMinimo')?.hasError('min')">No puede ser negativo</mat-error>
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
export class RefaccionesDialogComponent {
  form: FormGroup;
  editando: boolean;
  private ref = inject(MatDialogRef<RefaccionesDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { codigo: string; nombre: string; descripcion: string; precioCompra: number; precioVenta: number; stockActual: number; stockMinimo: number; activo: boolean; editando: boolean };
    this.editando = data.editando;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      codigo: [data.codigo, [Validators.required, Validators.maxLength(50)]],
      nombre: [data.nombre, [Validators.required, Validators.maxLength(200)]],
      descripcion: [data.descripcion],
      precioCompra: [data.precioCompra, [Validators.required, Validators.min(0)]],
      precioVenta: [data.precioVenta, [Validators.required, Validators.min(0)]],
      stockActual: [data.stockActual, [Validators.required, Validators.min(0)]],
      stockMinimo: [data.stockMinimo, [Validators.required, Validators.min(0)]],
      activo: [data.activo],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      codigo: v.codigo.trim(),
      nombre: v.nombre.trim(),
      descripcion: v.descripcion?.trim() || undefined,
      precioCompra: v.precioCompra,
      precioVenta: v.precioVenta,
      stockActual: v.stockActual,
      stockMinimo: v.stockMinimo,
      activo: v.activo,
    });
  }
}

@Component({
  selector: 'app-movimiento-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Movimiento - {{ refaccionNombre }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipoMovimiento">
            <mat-option value="Entrada">Entrada</mat-option>
            <mat-option value="Salida">Salida</mat-option>
            <mat-option value="Ajuste">Ajuste</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('tipoMovimiento')?.hasError('required')">Seleccione el tipo de movimiento</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cantidad</mat-label>
          <input matInput type="number" formControlName="cantidad" min="1" placeholder="Ej: 5">
          <mat-error *ngIf="form.get('cantidad')?.hasError('required')">La cantidad es obligatoria</mat-error>
          <mat-error *ngIf="form.get('cantidad')?.hasError('min')">Minimo 1</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Precio Unitario</mat-label>
          <input matInput type="number" formControlName="precioUnitario" min="0" step="0.01" placeholder="Ej: 150.00">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>
          <input matInput formControlName="motivo" maxlength="500" placeholder="Opcional">
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Registrar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`:host { display: block; } .full-width { width: 100%; }`]
})
export class MovimientoDialogComponent {
  form: FormGroup;
  refaccionNombre: string;
  refaccionId: number;
  precioCompra: number;
  precioVenta: number;
  private ref = inject(MatDialogRef<MovimientoDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { refaccionId: number; tipoMovimiento: string; cantidad: number; precioUnitario: number; motivo: string; refaccionNombre: string; precioCompra: number; precioVenta: number };
    this.refaccionNombre = data.refaccionNombre;
    this.refaccionId = data.refaccionId;
    this.precioCompra = data.precioCompra;
    this.precioVenta = data.precioVenta;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      tipoMovimiento: [data.tipoMovimiento, Validators.required],
      cantidad: [data.cantidad, [Validators.required, Validators.min(1)]],
      precioUnitario: [data.precioUnitario],
      motivo: [data.motivo],
    });

    this.form.get('tipoMovimiento')!.valueChanges.subscribe((tipo: string) => {
      if (tipo === 'Entrada') {
        this.form.patchValue({ precioUnitario: this.precioCompra });
      } else if (tipo === 'Salida') {
        this.form.patchValue({ precioUnitario: this.precioVenta });
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      refaccionId: this.refaccionId,
      tipoMovimiento: v.tipoMovimiento,
      cantidad: v.cantidad,
      precioUnitario: v.precioUnitario,
      motivo: v.motivo?.trim() || undefined,
    });
  }
}
