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
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, CreateClienteDto } from '../../models/cliente.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatTooltipModule, MatChipsModule, MatSnackBarModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  private service = inject(ClienteService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  datos: Cliente[] = [];
  datosFiltrados: Cliente[] = [];
  displayedColumns = ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'telefono', 'email', 'direccion', 'rfc', 'activo', 'acciones'];
  loading = false;
  filtroTexto = '';

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.service.getAll().subscribe({ next: d => { this.datos = d; this.filtrar(); this.loading = false; }, error: () => { this.loading = false; } });
  }

  filtrar(): void {
    const t = this.filtroTexto.toLowerCase().trim();
    this.datosFiltrados = t
      ? this.datos.filter(c =>
          c.nombre.toLowerCase().includes(t) ||
          c.apellidoPaterno.toLowerCase().includes(t) ||
          (c.apellidoMaterno?.toLowerCase().includes(t) ?? false) ||
          (c.telefono?.toLowerCase().includes(t) ?? false) ||
          (c.email?.toLowerCase().includes(t) ?? false) ||
          (c.rfc?.toLowerCase().includes(t) ?? false))
      : this.datos;
  }

  toggleActivo(cliente: Cliente): void {
    this.service.toggleActivo(cliente.id).subscribe({
      next: () => { this.snackBar.open(cliente.activo ? 'Cliente desactivado' : 'Cliente activado', 'OK', { duration: 3000 }); this.cargar(); },
      error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
    });
  }

  abrirDialogo(cliente?: Cliente): void {
    const dialogRef = this.dialog.open(ClientesDialogComponent, {
      width: '500px',
      data: {
        nombre: cliente?.nombre ?? '',
        apellidoPaterno: cliente?.apellidoPaterno ?? '',
        apellidoMaterno: cliente?.apellidoMaterno ?? '',
        telefono: cliente?.telefono ?? '',
        email: cliente?.email ?? '',
        direccion: cliente?.direccion ?? '',
        rfc: cliente?.rfc ?? '',
        editando: !!cliente
      }
    });

    dialogRef.afterClosed().subscribe((result: CreateClienteDto | null) => {
      if (!result) return;
      if (cliente) {
        this.service.update(cliente.id, result).subscribe({
          next: () => this.cargar(),
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      } else {
        this.service.create(result).subscribe({
          next: () => { this.snackBar.open('Cliente creado', 'OK', { duration: 3000 }); this.cargar(); },
          error: (e: HttpErrorResponse) => this.snackBar.open(this.extraerError(e), 'OK', { duration: 5000 })
        });
      }
    });
  }

  private extraerError(e: HttpErrorResponse): string {
    if (e.error?.errors) {
      return Object.values(e.error.errors).flat().join('. ');
    }
    if (e.error?.mensaje) {
      return e.error.mensaje;
    }
    return 'Error de servidor';
  }
}

@Component({
  selector: 'app-clientes-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nuevo' }} Cliente</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="100" placeholder="Ej: Juan">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
          <mat-error *ngIf="form.get('nombre')?.hasError('maxlength')">Maximo 100 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Apellido Paterno</mat-label>
          <input matInput formControlName="apellidoPaterno" maxlength="100" placeholder="Ej: Perez">
          <mat-error *ngIf="form.get('apellidoPaterno')?.hasError('required')">El apellido paterno es obligatorio</mat-error>
          <mat-error *ngIf="form.get('apellidoPaterno')?.hasError('maxlength')">Maximo 100 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Apellido Materno</mat-label>
          <input matInput formControlName="apellidoMaterno" maxlength="100" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefono</mat-label>
          <input matInput formControlName="telefono" maxlength="20" placeholder="Ej: 555-123-4567">
          <mat-error *ngIf="form.get('telefono')?.hasError('required')">El telefono es obligatorio</mat-error>
          <mat-error *ngIf="form.get('telefono')?.hasError('maxlength')">Maximo 20 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" placeholder="Ej: juan@correo.com">
          <mat-error *ngIf="form.get('email')?.hasError('email')">Formato de email invalido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Direccion</mat-label>
          <input matInput formControlName="direccion" placeholder="Opcional">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>RFC</mat-label>
          <input matInput formControlName="rfc" maxlength="13" placeholder="Ej: PEHJ901234AB1">
          <mat-error *ngIf="form.get('rfc')?.hasError('maxlength')">Maximo 13 caracteres</mat-error>
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
export class ClientesDialogComponent {
  form: FormGroup;
  editando: boolean;
  private ref = inject(MatDialogRef<ClientesDialogComponent>);

  constructor() {
    const data = inject(MAT_DIALOG_DATA) as { nombre: string; apellidoPaterno: string; apellidoMaterno: string; telefono: string; email: string; direccion: string; rfc: string; editando: boolean };
    this.editando = data.editando;
    const fb = inject(FormBuilder);
    this.form = fb.group({
      nombre: [data.nombre, [Validators.required, Validators.maxLength(100)]],
      apellidoPaterno: [data.apellidoPaterno, [Validators.required, Validators.maxLength(100)]],
      apellidoMaterno: [data.apellidoMaterno],
      telefono: [data.telefono, [Validators.required, Validators.maxLength(20)]],
      email: [data.email, [Validators.email]],
      direccion: [data.direccion],
      rfc: [data.rfc, [Validators.maxLength(13)]],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.ref.close({
      nombre: v.nombre.trim(),
      apellidoPaterno: v.apellidoPaterno.trim(),
      apellidoMaterno: v.apellidoMaterno?.trim() || null,
      telefono: v.telefono.trim(),
      email: v.email?.trim() || null,
      direccion: v.direccion?.trim() || null,
      rfc: v.rfc?.trim() || null,
    });
  }
}
