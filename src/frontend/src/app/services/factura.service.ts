import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura, CreateFacturaDto, PagarFacturaDto, UpdateFacturaDto } from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private url = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Factura[]> { return this.http.get<Factura[]>(this.url); }
  getById(id: number): Observable<Factura> { return this.http.get<Factura>(`${this.url}/${id}`); }
  create(dto: CreateFacturaDto): Observable<Factura> { return this.http.post<Factura>(this.url, dto); }
  pagar(id: number, dto: PagarFacturaDto): Observable<Factura> { return this.http.post<Factura>(`${this.url}/${id}/pagar`, dto); }
  cancelar(id: number): Observable<Factura> { return this.http.post<Factura>(`${this.url}/${id}/cancelar`, {}); }
  update(id: number, dto: UpdateFacturaDto): Observable<Factura> { return this.http.put<Factura>(`${this.url}/${id}`, dto); }

  downloadPdf(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.url}/${id}/pdf`, { responseType: 'blob', observe: 'response' });
  }
}
