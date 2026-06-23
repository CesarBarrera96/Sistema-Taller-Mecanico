import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { Observable, tap, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LicenciaStatus, ActivarLicenciaDto } from '../models/licencia.model';

@Injectable({ providedIn: 'root' })
export class LicenciaService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private url = `${environment.apiUrl}/licencia`;

  private _status = signal<LicenciaStatus>({ activa: false, estado: 'Vencida', fechaExpiracion: null, diasRestantes: null, minutosRestantes: null });
  private _loaded = signal(false);
  private _showDialog = signal(false);

  readonly status = this._status.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly licenciaActiva = computed(() => this._status().activa);
  readonly licenciaVencida = computed(() => !this._status().activa);
  readonly estadoLicencia = computed(() => this._status().estado);
  readonly fechaExpiracion = computed(() => this._status().fechaExpiracion);
  readonly diasRestantes = computed(() => this._status().diasRestantes);
  readonly minutosRestantes = computed(() => this._status().minutosRestantes);
  readonly showDialog = this._showDialog.asReadonly();

  private routingSubscription = this.router.events.pipe(
    filter((e: RouterEvent): e is NavigationEnd => e instanceof NavigationEnd)
  ).subscribe((e) => {
    const operationalRoutes = ['/clientes', '/vehiculos', '/empleados', '/servicios', '/refacciones', '/ordenes', '/citas', '/facturas'];
    if (operationalRoutes.some(r => e.urlAfterRedirects.startsWith(r))) {
      this.checkStatus().subscribe();
    }
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.routingSubscription.unsubscribe();
    });
  }

  checkStatus(): Observable<LicenciaStatus> {
    return this.http.get<LicenciaStatus>(`${this.url}/status`).pipe(
      tap(s => {
        this._status.set(s);
        this._loaded.set(true);
        this.saveToStorage(s);
      }),
      catchError(() => {
        this._status.set({ activa: false, estado: 'Vencida', fechaExpiracion: null, diasRestantes: null, minutosRestantes: null });
        this._loaded.set(true);
        return of(this._status());
      })
    );
  }

  activar(token: string): Observable<LicenciaStatus> {
    const dto: ActivarLicenciaDto = { token };
    return this.http.post<LicenciaStatus>(`${this.url}/activar`, dto).pipe(
      tap(s => {
        this._status.set(s);
        this.saveToStorage(s);
      })
    );
  }

  canWrite(): boolean {
    return this._status().activa;
  }

  showLicenciaExpiredDialog(): void {
    this._showDialog.set(true);
  }

  dismissDialog(): void {
    this._showDialog.set(false);
  }

  goToConfiguracion(): void {
    this._showDialog.set(false);
    this.router.navigate(['/configuracion']);
  }

  private saveToStorage(status: LicenciaStatus): void {
    localStorage.setItem('taller_licencia', JSON.stringify(status));
  }
}
