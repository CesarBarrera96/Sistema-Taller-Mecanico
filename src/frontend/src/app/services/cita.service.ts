import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cita, CreateCitaDto, UpdateCitaDto } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private url = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cita[]> { return this.http.get<Cita[]>(this.url); }
  getById(id: number): Observable<Cita> { return this.http.get<Cita>(`${this.url}/${id}`); }
  getByFecha(fecha: string): Observable<Cita[]> { return this.http.get<Cita[]>(`${this.url}/fecha/${fecha}`); }
  create(dto: CreateCitaDto): Observable<Cita> { return this.http.post<Cita>(this.url, dto); }
  update(id: number, dto: UpdateCitaDto): Observable<Cita> { return this.http.put<Cita>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  convertirAOrden(id: number): Observable<Cita> { return this.http.post<Cita>(`${this.url}/${id}/convertir-orden`, {}); }
}
