import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConfiguracionTaller, UpdateConfiguracionTallerDto } from '../models/configuracion-taller.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracionTallerService {
  private url = `${environment.apiUrl}/configuracion`;
  private baseUrl = environment.apiUrl.replace('/api', '');

  private _config = signal<ConfiguracionTaller>({ id: 0, nombre: 'Taller Mecanico' });
  private _logoVersion = signal(Date.now());

  readonly config = this._config.asReadonly();
  readonly nombreTaller = computed(() => this._config().nombre);
  readonly logoUrl = computed(() => {
    const ruta = this._config().logoRuta;
    return ruta ? `${this.baseUrl}${ruta}?v=${this._logoVersion()}` : null;
  });

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  get(): Observable<ConfiguracionTaller> {
    return this.http.get<ConfiguracionTaller>(this.url).pipe(
      tap(c => {
        this._config.set(c);
        this._logoVersion.set(Date.now());
        this.saveToStorage(c);
      })
    );
  }

  update(dto: UpdateConfiguracionTallerDto): Observable<ConfiguracionTaller> {
    return this.http.put<ConfiguracionTaller>(this.url, dto).pipe(
      tap(c => {
        this._config.set(c);
        this.saveToStorage(c);
      })
    );
  }

  uploadLogo(file: File): Observable<{ logoRuta: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ logoRuta: string }>(`${this.url}/logo`, formData).pipe(
      tap(() => this.refreshConfig())
    );
  }

  deleteLogo(): Observable<void> {
    return this.http.delete<void>(`${this.url}/logo`).pipe(
      tap(() => this.refreshConfig())
    );
  }

  private refreshConfig(): void {
    this.get().subscribe();
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem('taller_config');
    if (stored) {
      this._config.set(JSON.parse(stored));
    }
  }

  private saveToStorage(config: ConfiguracionTaller): void {
    localStorage.setItem('taller_config', JSON.stringify(config));
  }
}
