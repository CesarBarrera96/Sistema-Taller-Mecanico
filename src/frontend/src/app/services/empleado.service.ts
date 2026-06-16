import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../models/empleado.model';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private url = `${environment.apiUrl}/empleados`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Empleado[]> { return this.http.get<Empleado[]>(this.url); }
  getById(id: number): Observable<Empleado> { return this.http.get<Empleado>(`${this.url}/${id}`); }
  create(dto: CreateEmpleadoDto): Observable<Empleado> { return this.http.post<Empleado>(this.url, dto); }
  update(id: number, dto: UpdateEmpleadoDto): Observable<Empleado> { return this.http.put<Empleado>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
