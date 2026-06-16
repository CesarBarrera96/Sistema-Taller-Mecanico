import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { OrdenService } from '../../services/orden.service';
import { CitaService } from '../../services/cita.service';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private vehiculoService = inject(VehiculoService);
  private ordenService = inject(OrdenService);
  private citaService = inject(CitaService);
  private facturaService = inject(FacturaService);

  stats = [
    { label: 'Clientes', icon: 'people', count: 0, color: '#0056b0', bg: 'rgba(0, 86, 176, 0.1)' },
    { label: 'Vehiculos', icon: 'directions_car', count: 0, color: '#007ba1', bg: 'rgba(0, 123, 161, 0.1)' },
    { label: 'Ordenes Activas', icon: 'receipt_long', count: 0, color: '#c16e14', bg: 'rgba(193, 110, 20, 0.1)' },
    { label: 'Citas Hoy', icon: 'event', count: 0, color: '#6a3200', bg: 'rgba(106, 50, 0, 0.1)' },
    { label: 'Facturas Pendientes', icon: 'payments', count: 0, color: '#ba1a1a', bg: 'rgba(186, 26, 26, 0.1)' },
  ];

  ngOnInit(): void {
    this.clienteService.getAll().subscribe(c => this.stats[0].count = c.length);
    this.vehiculoService.getAll().subscribe(v => this.stats[1].count = v.length);
    this.ordenService.getAll().subscribe(o => this.stats[2].count = o.filter(x => x.estatus !== 'Entregada' && x.estatus !== 'Cancelada').length);
    const today = new Date().toISOString().split('T')[0];
    this.citaService.getByFecha(today).subscribe(c => this.stats[3].count = c.length);
    this.facturaService.getAll().subscribe(f => this.stats[4].count = f.filter(x => x.estatus === 'Pendiente').length);
  }
}
