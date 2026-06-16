import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpErrorResponse } from '@angular/common/http';
import { VehiculoService } from '../../services/vehiculo.service';
import { ClienteService } from '../../services/cliente.service';
import { Vehiculo, CreateVehiculoDto } from '../../models/vehiculo.model';
import { Cliente } from '../../models/cliente.model';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './vehiculos.component.html',
  styleUrl: './vehiculos.component.css'
})
export class VehiculosComponent implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private clienteService = inject(ClienteService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  datos: Vehiculo[] = [];
  datosFiltrados: Vehiculo[] = [];
  clientes: Cliente[] = [];
  displayedColumns = ['id', 'vehiculo', 'placas', 'anio', 'color', 'vin', 'kilometraje', 'cliente', 'acciones'];
  loading = false;

  filtroCtrl = new FormControl<string>('');

  constructor() {
    this.filtroCtrl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(term => {
      const t = (term || '').toLowerCase();
      this.datosFiltrados = t
        ? this.datos.filter(v =>
            v.marca.toLowerCase().includes(t) ||
            v.modelo.toLowerCase().includes(t) ||
            v.placas.toLowerCase().includes(t) ||
            v.vin?.toLowerCase().includes(t) ||
            v.nombreCliente.toLowerCase().includes(t))
        : this.datos;
    });
  }

  ngOnInit(): void {
    this.cargar();
    this.clienteService.getAll().subscribe(c => this.clientes = c);
  }

  cargar(): void {
    this.loading = true;
    this.vehiculoService.getAll().subscribe({
      next: d => {
        this.datos = d;
        this.datosFiltrados = this.datos;
        this.filtroCtrl.setValue('');
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar este vehiculo?')) {
      this.vehiculoService.delete(id).subscribe({
        next: () => this.cargar(),
        error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
      });
    }
  }

  abrirDialogo(vehiculo?: Vehiculo): void {
    const dialogRef = this.dialog.open(VehiculosDialogComponent, {
      width: '500px',
      data: {
        clienteId: vehiculo?.clienteId ?? 0,
        marca: vehiculo?.marca ?? '',
        modelo: vehiculo?.modelo ?? '',
        anio: vehiculo?.anio ?? new Date().getFullYear(),
        color: vehiculo?.color ?? '',
        placas: vehiculo?.placas ?? '',
        vin: vehiculo?.vin ?? '',
        kilometraje: vehiculo?.kilometraje ?? 0,
        editando: !!vehiculo,
        clientes: this.clientes
      }
    });

    dialogRef.afterClosed().subscribe((result: CreateVehiculoDto | null) => {
      if (!result) return;
      if (vehiculo) {
        this.vehiculoService.update(vehiculo.id, result).subscribe({
          next: () => this.cargar(),
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      } else {
        this.vehiculoService.create(result).subscribe({
          next: () => { this.snackBar.open('Vehiculo creado', 'OK', { duration: 3000 }); this.cargar(); },
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
  selector: 'app-vehiculos-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatAutocompleteModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nuevo' }} Vehiculo</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cliente</mat-label>
          <input matInput type="text" [formControl]="clienteCtrl" [matAutocomplete]="auto" placeholder="Buscar cliente...">
          <mat-autocomplete #auto="matAutocomplete" [displayWith]="mostrarCliente" (optionSelected)="seleccionarCliente($event)">
            @for (c of clientesFiltrados | async; track c.id) {
              <mat-option [value]="c">{{ c.nombre }} {{ c.apellidoPaterno }} {{ c.apellidoMaterno || '' }}</mat-option>
            }
          </mat-autocomplete>
          <mat-error *ngIf="form.get('clienteId')?.hasError('required')">Seleccione un cliente</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Marca</mat-label>
          <input matInput formControlName="marca" maxlength="50" placeholder="Ej: Toyota">
          <mat-error *ngIf="form.get('marca')?.hasError('required')">La marca es obligatoria</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Modelo</mat-label>
          <input matInput formControlName="modelo" maxlength="50" placeholder="Ej: Corolla">
          <mat-error *ngIf="form.get('modelo')?.hasError('required')">El modelo es obligatorio</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Anio</mat-label>
          <input matInput type="number" formControlName="anio" min="1900" max="2030" placeholder="Ej: 2024">
          <mat-error *ngIf="form.get('anio')?.hasError('required')">El ano es obligatorio</mat-error>
          <mat-error *ngIf="form.get('anio')?.hasError('min')">Ano minimo 1900</mat-error>
          <mat-error *ngIf="form.get('anio')?.hasError('max')">Ano maximo 2030</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Color</mat-label>
          <input matInput formControlName="color" maxlength="30" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Placas</mat-label>
          <input matInput formControlName="placas" maxlength="10" placeholder="Ej: ABC-123">
          <mat-error *ngIf="form.get('placas')?.hasError('required')">Las placas son obligatorias</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>VIN</mat-label>
          <input matInput formControlName="vin" maxlength="17" placeholder="Opcional, 17 caracteres">
          <mat-error *ngIf="form.get('vin')?.hasError('maxlength')">Maximo 17 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Kilometraje</mat-label>
          <input matInput type="number" formControlName="kilometraje" min="0" placeholder="Opcional">
          <mat-error *ngIf="form.get('kilometraje')?.hasError('min')">No puede ser negativo</mat-error>
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
export class VehiculosDialogComponent {
  form: FormGroup;
  editando: boolean;
  clientes: Cliente[];
  clienteCtrl = new FormControl<string | Cliente>('', { validators: Validators.required });
  clientesFiltrados: Observable<Cliente[]>;
  private ref = inject(MatDialogRef<VehiculosDialogComponent>);
  private snackBar = inject(MatSnackBar);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { clienteId: number; marca: string; modelo: string; anio: number; color: string; placas: string; vin: string; kilometraje: number; editando: boolean; clientes: Cliente[] };
    this.editando = data.editando;
    this.clientes = data.clientes;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      clienteId: [data.clienteId || null, Validators.required],
      marca: [data.marca, [Validators.required, Validators.maxLength(50)]],
      modelo: [data.modelo, [Validators.required, Validators.maxLength(50)]],
      anio: [data.anio, [Validators.required, Validators.min(1900), Validators.max(2030)]],
      color: [data.color],
      placas: [data.placas, [Validators.required, Validators.maxLength(10)]],
      vin: [data.vin, [Validators.maxLength(17)]],
      kilometraje: [data.kilometraje, [Validators.min(0)]],
    });

    const clienteInicial = data.clienteId
      ? this.clientes.find(c => c.id === data.clienteId) ?? ''
      : '';
    this.clienteCtrl.setValue(clienteInicial);

    this.clientesFiltrados = this.clienteCtrl.valueChanges.pipe(
      startWith(''),
      map((val: any) => {
        const term = typeof val === 'string' ? val.toLowerCase() : '';
        return term
          ? this.clientes.filter(c =>
              c.nombre.toLowerCase().includes(term) ||
              c.apellidoPaterno.toLowerCase().includes(term) ||
              (c.apellidoMaterno?.toLowerCase().includes(term) ?? false))
          : this.clientes;
      })
    );
  }

  mostrarCliente = (c: any): string => {
    if (c == null || typeof c === 'string') return c || '';
    const cli = c as Cliente;
    return `${cli.nombre} ${cli.apellidoPaterno} ${cli.apellidoMaterno || ''}`.trim();
  };

  seleccionarCliente(event: MatAutocompleteSelectedEvent): void {
    const cliente = event.option.value as Cliente;
    this.form.patchValue({ clienteId: cliente.id });
  }

  guardar(): void {
    if (this.form.invalid) return;
    if (!this.form.value.clienteId) {
      this.snackBar.open('Seleccione un cliente', 'OK', { duration: 3000 });
      return;
    }
    const v = this.form.value;
    this.ref.close({
      clienteId: v.clienteId,
      marca: v.marca.trim(),
      modelo: v.modelo.trim(),
      anio: v.anio,
      color: v.color?.trim() || undefined,
      placas: v.placas.trim(),
      vin: v.vin?.trim() || undefined,
      kilometraje: v.kilometraje || undefined,
  });}
}
