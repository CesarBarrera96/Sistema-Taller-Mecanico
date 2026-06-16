import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrdenTrabajo, CreateOrdenTrabajoDto, UpdateOrdenTrabajoDto, EstatusOrden } from '../models/orden-trabajo.model';

@Injectable({ providedIn: 'root' })
export class OrdenService {
  private url = `${environment.apiUrl}/ordenes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrdenTrabajo[]> { return this.http.get<OrdenTrabajo[]>(this.url); }
  getById(id: number): Observable<OrdenTrabajo> { return this.http.get<OrdenTrabajo>(`${this.url}/${id}`); }
  getByEstatus(estatus: EstatusOrden): Observable<OrdenTrabajo[]> { return this.http.get<OrdenTrabajo[]>(`${this.url}/estatus/${estatus}`); }
  create(dto: CreateOrdenTrabajoDto): Observable<OrdenTrabajo> { return this.http.post<OrdenTrabajo>(this.url, dto); }
  update(id: number, dto: UpdateOrdenTrabajoDto): Observable<OrdenTrabajo> { return this.http.put<OrdenTrabajo>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
