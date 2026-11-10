import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Asiento, AsientoResumen, FiltroAsientos, GuardarAsiento } from './models/asiento.model';

@Injectable({
  providedIn: 'root',
})
export class AsientosService {
  private url = `${environment.apiUrl}/asientos`;

  constructor(private http: HttpClient) {}

  listar(filtro: FiltroAsientos = {}): Observable<AsientoResumen[]> {
    let params = new HttpParams();
    if (filtro.idPeriodo) params = params.set('idPeriodo', filtro.idPeriodo);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    return this.http.get<AsientoResumen[]>(this.url, { params });
  }

  obtener(idAsiento: number): Observable<Asiento> {
    return this.http.get<Asiento>(`${this.url}/${idAsiento}`);
  }

  crear(asiento: GuardarAsiento): Observable<Asiento> {
    return this.http.post<Asiento>(this.url, asiento);
  }

  /** Solo para borradores: reemplaza encabezado y líneas. */
  editar(idAsiento: number, asiento: GuardarAsiento): Observable<Asiento> {
    return this.http.put<Asiento>(`${this.url}/${idAsiento}`, asiento);
  }

  publicar(idAsiento: number): Observable<Asiento> {
    return this.http.post<Asiento>(`${this.url}/${idAsiento}/publicar`, null);
  }

  anular(idAsiento: number): Observable<Asiento> {
    return this.http.post<Asiento>(`${this.url}/${idAsiento}/anular`, null);
  }
}
