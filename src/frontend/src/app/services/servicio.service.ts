import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Servicio, CreateServicioDto, UpdateServicioDto } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private url = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Servicio[]> { return this.http.get<Servicio[]>(this.url); }
  getById(id: number): Observable<Servicio> { return this.http.get<Servicio>(`${this.url}/${id}`); }
  create(dto: CreateServicioDto): Observable<Servicio> { return this.http.post<Servicio>(this.url, dto); }
  update(id: number, dto: UpdateServicioDto): Observable<Servicio> { return this.http.put<Servicio>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
