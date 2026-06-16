import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private url = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> { return this.http.get<Cliente[]>(this.url); }
  getById(id: number): Observable<Cliente> { return this.http.get<Cliente>(`${this.url}/${id}`); }
  create(dto: CreateClienteDto): Observable<Cliente> { return this.http.post<Cliente>(this.url, dto); }
  update(id: number, dto: UpdateClienteDto): Observable<Cliente> { return this.http.put<Cliente>(`${this.url}/${id}`, dto); }
  toggleActivo(id: number): Observable<Cliente> { return this.http.patch<Cliente>(`${this.url}/${id}/toggle-activo`, {}); }
}
