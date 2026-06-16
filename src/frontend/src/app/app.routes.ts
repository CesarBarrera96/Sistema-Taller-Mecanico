import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clientes', loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'vehiculos', loadComponent: () => import('./features/vehiculos/vehiculos.component').then(m => m.VehiculosComponent) },
      { path: 'empleados', loadComponent: () => import('./features/empleados/empleados.component').then(m => m.EmpleadosComponent) },
      { path: 'servicios', loadComponent: () => import('./features/servicios/servicios.component').then(m => m.ServiciosComponent) },
      { path: 'refacciones', loadComponent: () => import('./features/refacciones/refacciones.component').then(m => m.RefaccionesComponent) },
      { path: 'ordenes', loadComponent: () => import('./features/ordenes/ordenes.component').then(m => m.OrdenesComponent) },
      { path: 'citas', loadComponent: () => import('./features/citas/citas.component').then(m => m.CitasComponent) },
        { path: 'facturas', loadComponent: () => import('./features/facturas/facturas.component').then(m => m.FacturasComponent) },
        { path: 'configuracion', loadComponent: () => import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
      ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
