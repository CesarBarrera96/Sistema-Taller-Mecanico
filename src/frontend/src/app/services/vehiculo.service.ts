import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vehiculo, CreateVehiculoDto, UpdateVehiculoDto } from '../models/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private url = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vehiculo[]> { return this.http.get<Vehiculo[]>(this.url); }
  getById(id: number): Observable<Vehiculo> { return this.http.get<Vehiculo>(`${this.url}/${id}`); }
  getByCliente(clienteId: number): Observable<Vehiculo[]> { return this.http.get<Vehiculo[]>(`${this.url}/cliente/${clienteId}`); }
  create(dto: CreateVehiculoDto): Observable<Vehiculo> { return this.http.post<Vehiculo>(this.url, dto); }
  update(id: number, dto: UpdateVehiculoDto): Observable<Vehiculo> { return this.http.put<Vehiculo>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
