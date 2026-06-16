import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
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
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FacturaService } from '../../services/factura.service';
import { OrdenService } from '../../services/orden.service';
import { Factura, CreateFacturaDto, PagarFacturaDto, EstatusFactura, UpdateFacturaDto, FacturaDetalleDto, UpdateFacturaDetalleDto } from '../../models/factura.model';
import { OrdenTrabajo } from '../../models/orden-trabajo.model';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatSelectModule, MatChipsModule, MatAutocompleteModule, MatSnackBarModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css',
  animations: [
    trigger('detalleExpand', [
      transition(':enter', [
        style({ height: '0', opacity: '0', overflow: 'hidden' }),
        animate('200ms ease-out', style({ height: '*', opacity: '1' }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: '1', overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '0', opacity: '0' }))
      ])
    ])
  ]
})
export class FacturasComponent implements OnInit {
  private service = inject(FacturaService);
  private ordenService = inject(OrdenService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  datos: Factura[] = [];
  ordenes: OrdenTrabajo[] = [];
  displayedColumns = ['folio', 'orden', 'cliente', 'total', 'estatus', 'fechaFacturacion', 'acciones'];
  loading = false;
  facturaSeleccionada: Factura | null = null;
  readonly estatusOptions = EstatusFactura;

  ngOnInit(): void { this.cargar(); this.ordenService.getAll().subscribe(o => this.ordenes = o); }

  cargar(): void {
    this.loading = true;
    this.service.getAll().subscribe({ next: d => { this.datos = d; this.loading = false; }, error: () => { this.loading = false; } });
  }

  abrirDialogo(): void {
    const dialogRef = this.dialog.open(FacturasDialogComponent, {
      width: '450px',
      data: { ordenTrabajoId: 0, ordenes: this.ordenes }
    });

    dialogRef.afterClosed().subscribe((result: CreateFacturaDto | null) => {
      if (!result) return;
      this.service.create(result).subscribe({
        next: () => { this.snackBar.open('Factura creada', 'OK', { duration: 3000 }); this.cargar(); },
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    });
  }

  pagar(factura: Factura): void {
    const dialogRef = this.dialog.open(PagarDialogComponent, { width: '400px', data: { folio: factura.folio } });

    dialogRef.afterClosed().subscribe((result: PagarFacturaDto | null) => {
      if (!result) return;
      this.service.pagar(factura.id, result).subscribe({
        next: () => { this.snackBar.open('Factura pagada', 'OK', { duration: 3000 }); this.cargar(); },
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    });
  }

  cancelar(factura: Factura): void {
    if (confirm('¿Cancelar esta factura?')) {
      this.service.cancelar(factura.id).subscribe({
        next: () => { this.snackBar.open('Factura cancelada', 'OK', { duration: 3000 }); this.cargar(); },
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    }
  }

  descargarPdf(factura: Factura): void {
    this.service.downloadPdf(factura.id).subscribe({
      next: (response) => {
        const configIncomplete = response.headers.get('X-Config-Incomplete') === 'true';
        if (configIncomplete) {
          this.snackBar.open('Configuración del taller incompleta. El PDF se generó con datos genéricos. Ve a Configuración para completar los datos.', 'OK', { duration: 6000 });
        }
        const blob = response.body!;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura_${factura.folio}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Error al generar PDF', 'OK', { duration: 3000 })
    });
  }

  verDetalles(factura: Factura): void {
    this.facturaSeleccionada = this.facturaSeleccionada?.id === factura.id ? null : factura;
  }

  editarFactura(factura: Factura): void {
    const dialogRef = this.dialog.open(EditarFacturaDialogComponent, {
      width: '700px',
      data: { metodoPago: factura.metodoPago, observaciones: factura.observaciones, detalles: factura.detalles }
    });

    dialogRef.afterClosed().subscribe((result: UpdateFacturaDto | null) => {
      if (!result) return;
      this.service.update(factura.id, result).subscribe({
        next: () => { this.snackBar.open('Factura actualizada', 'OK', { duration: 3000 }); this.cargar(); },
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    });
  }

  estatusColor(estatus: EstatusFactura): string {
    const colors: Record<string, string> = { 'Pendiente': 'warn', 'Pagada': 'primary', 'Cancelada': 'warn' };
    return colors[estatus] || '';
  }

  private extraerError(e: HttpErrorResponse): string {
    if (e.error?.errors) { return Object.values(e.error.errors).flat().join('. '); }
    if (e.error?.mensaje) { return e.error.mensaje; }
    return 'Error de servidor';
  }
}

@Component({
  selector: 'app-facturas-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatAutocompleteModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Nueva Factura</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Orden de Trabajo</mat-label>
          <input matInput type="text" [formControl]="ordenCtrl" [matAutocomplete]="auto" placeholder="Buscar por folio...">
          <mat-autocomplete #auto="matAutocomplete" [displayWith]="mostrarOrden" (optionSelected)="seleccionarOrden($event)">
            @for (o of ordenesFiltradas | async; track o.id) {
              <mat-option [value]="o">{{ o.folio }} - {{ o.nombreCliente }}</mat-option>
            }
          </mat-autocomplete>
          <mat-error *ngIf="form.get('ordenTrabajoId')?.hasError('required')">Seleccione una orden de trabajo</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Metodo de Pago</mat-label>
          <mat-select formControlName="metodoPago">
            <mat-option value="Efectivo">Efectivo</mat-option>
            <mat-option value="Tarjeta">Tarjeta</mat-option>
            <mat-option value="Transferencia">Transferencia</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <input matInput formControlName="observaciones" placeholder="Opcional">
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Crear Factura</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`:host { display: block; } .full-width { width: 100%; }`]
})
export class FacturasDialogComponent {
  form: FormGroup;
  ordenes: OrdenTrabajo[];
  ordenCtrl = new FormControl<string | OrdenTrabajo>('', { validators: Validators.required });
  ordenesFiltradas: Observable<OrdenTrabajo[]>;
  private ref = inject(MatDialogRef<FacturasDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { ordenTrabajoId: number; ordenes: OrdenTrabajo[] };
    this.ordenes = data.ordenes;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      ordenTrabajoId: [data.ordenTrabajoId || null, Validators.required],
      metodoPago: [''],
      observaciones: [''],
    });

    this.ordenesFiltradas = this.ordenCtrl.valueChanges.pipe(
      startWith(''),
      map(val => {
        const term = typeof val === 'string' ? val.toLowerCase() : '';
        return term
          ? this.ordenes.filter(o => o.folio.toLowerCase().includes(term) || o.nombreCliente.toLowerCase().includes(term))
          : this.ordenes;
      })
    );
  }

  mostrarOrden = (o: any): string => {
    if (o == null || typeof o === 'string') return o || '';
    const orden = o as OrdenTrabajo;
    return `${orden.folio} - ${orden.nombreCliente}`;
  };

  seleccionarOrden(event: MatAutocompleteSelectedEvent): void {
    const orden = event.option.value as OrdenTrabajo;
    this.form.patchValue({ ordenTrabajoId: orden.id });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      ordenTrabajoId: v.ordenTrabajoId,
      metodoPago: v.metodoPago?.trim() || undefined,
      observaciones: v.observaciones?.trim() || undefined,
    });
  }
}

@Component({
  selector: 'app-pagar-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Pagar Factura {{ folio }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Metodo de Pago</mat-label>
          <mat-select formControlName="metodoPago">
            <mat-option value="Efectivo">Efectivo</mat-option>
            <mat-option value="Tarjeta">Tarjeta</mat-option>
            <mat-option value="Transferencia">Transferencia</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('metodoPago')?.hasError('required')">Seleccione un metodo de pago</mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Pagar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`:host { display: block; } .full-width { width: 100%; }`]
})
export class PagarDialogComponent {
  form: FormGroup;
  folio: string;
  private ref = inject(MatDialogRef<PagarDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { folio: string };
    this.folio = data.folio;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      metodoPago: ['Efectivo', Validators.required],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.ref.close({ metodoPago: this.form.value.metodoPago });
  }
}

@Component({
  selector: 'app-editar-factura-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSelectModule, MatTableModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Editar Factura</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="dialog-content">
        <h4>Detalles</h4>
        <div formArrayName="detalles" class="detalles-list">
          @for (d of detallesControls; track $index; let i = $index) {
            <div [formGroupName]="i" class="detalle-row">
              <mat-form-field appearance="outline" class="detalle-concepto">
                <mat-label>Concepto</mat-label>
                <input matInput formControlName="concepto">
              </mat-form-field>
              <mat-form-field appearance="outline" class="detalle-cantidad">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" formControlName="cantidad" min="1" step="1">
              </mat-form-field>
              <mat-form-field appearance="outline" class="detalle-precio">
                <mat-label>P. Unitario</mat-label>
                <input matInput type="number" formControlName="precioUnitario" min="0" step="0.01">
              </mat-form-field>
              <mat-form-field appearance="outline" class="detalle-subtotal-readonly">
                <mat-label>Subtotal</mat-label>
                <input matInput [value]="subtotal(i) | currency:'MXN':'symbol':'1.2-2'" readonly>
              </mat-form-field>
            </div>
          }
        </div>
        <div class="totales-preview">
          <span>Subtotal: {{ totalSubtotal | currency:'MXN':'symbol':'1.2-2' }}</span>
          <span>IVA (16%): {{ (totalSubtotal * 0.16) | currency:'MXN':'symbol':'1.2-2' }}</span>
          <strong>Total: {{ (totalSubtotal * 1.16) | currency:'MXN':'symbol':'1.2-2' }}</strong>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Metodo de Pago</mat-label>
          <mat-select formControlName="metodoPago">
            <mat-option value="">Sin metodo</mat-option>
            <mat-option value="Efectivo">Efectivo</mat-option>
            <mat-option value="Tarjeta">Tarjeta</mat-option>
            <mat-option value="Transferencia">Transferencia</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2" placeholder="Opcional"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    :host { display: block; }
    .full-width { width: 100%; }
    .dialog-content { overflow-y: auto; max-height: 70vh; }
    .detalles-list { display: flex; flex-direction: column; gap: 8px; }
    .detalle-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .detalle-concepto { flex: 3; min-width: 140px; }
    .detalle-cantidad { flex: 1; min-width: 70px; }
    .detalle-precio { flex: 1.5; min-width: 100px; }
    .detalle-subtotal-readonly { flex: 1.5; min-width: 100px; }
    .totales-preview { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin: 12px 0 16px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.12); font-size: 14px; }
  `]
})
export class EditarFacturaDialogComponent {
  form: FormGroup;
  private ref = inject(MatDialogRef<EditarFacturaDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { metodoPago?: string; observaciones?: string; detalles: FacturaDetalleDto[] };
    const fb = inject(FormBuilder);
    const detallesArray = fb.array(data.detalles.map(d =>
      fb.group({
        id: [d.id],
        concepto: [d.concepto, [Validators.required, Validators.maxLength(200)]],
        cantidad: [d.cantidad, [Validators.required, Validators.min(1)]],
        precioUnitario: [d.precioUnitario, [Validators.required, Validators.min(0)]],
      })
    ));
    this.form = fb.group({
      metodoPago: [data.metodoPago || ''],
      observaciones: [data.observaciones || ''],
      detalles: detallesArray,
    });
  }

  get detallesControls(): FormGroup[] {
    return (this.form.get('detalles') as any).controls as FormGroup[];
  }

  subtotal(i: number): number {
    const d = this.detallesControls[i];
    return (d.value.cantidad || 0) * (d.value.precioUnitario || 0);
  }

  get totalSubtotal(): number {
    return this.detallesControls.reduce((sum, d) => sum + ((d.value.cantidad || 0) * (d.value.precioUnitario || 0)), 0);
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const detalles: UpdateFacturaDetalleDto[] = v.detalles.map((d: any) => ({
      id: d.id,
      concepto: d.concepto?.trim(),
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
    }));
    this.ref.close({
      metodoPago: v.metodoPago?.trim() || undefined,
      observaciones: v.observaciones?.trim() || undefined,
      detalles,
    });
  }
}
