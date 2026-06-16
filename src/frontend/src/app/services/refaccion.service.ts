import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Refaccion, CreateRefaccionDto, UpdateRefaccionDto, InventarioMovimientoDto } from '../models/refaccion.model';

@Injectable({ providedIn: 'root' })
export class RefaccionService {
  private url = `${environment.apiUrl}/refacciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Refaccion[]> { return this.http.get<Refaccion[]>(this.url); }
  getById(id: number): Observable<Refaccion> { return this.http.get<Refaccion>(`${this.url}/${id}`); }
  getStockBajo(): Observable<Refaccion[]> { return this.http.get<Refaccion[]>(`${this.url}/stock-bajo`); }
  create(dto: CreateRefaccionDto): Observable<Refaccion> { return this.http.post<Refaccion>(this.url, dto); }
  update(id: number, dto: UpdateRefaccionDto): Observable<Refaccion> { return this.http.put<Refaccion>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  registrarMovimiento(dto: InventarioMovimientoDto): Observable<Refaccion> { return this.http.post<Refaccion>(`${this.url}/movimiento`, dto); }
}
