import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Refleja la tabla `comprobantes_tipos`. consecutivoActual es el número del próximo comprobante. */
export interface TipoComprobante {
  idTipoComprobante: number;
  codigo: string;
  nombre: string;
  consecutivoActual: number;
}

export interface EditarTipoComprobante {
  nombre: string;
  consecutivoActual: number;
}

export interface CrearTipoComprobante extends EditarTipoComprobante {
  codigo: string;
}

@Injectable({
  providedIn: 'root',
})
export class TiposComprobanteService {
  private url = `${environment.apiUrl}/tipos-comprobante`;

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoComprobante[]> {
    return this.http.get<TipoComprobante[]>(this.url);
  }

  crear(tipo: CrearTipoComprobante): Observable<TipoComprobante> {
    return this.http.post<TipoComprobante>(this.url, tipo);
  }

  editar(idTipoComprobante: number, cambios: EditarTipoComprobante): Observable<TipoComprobante> {
    return this.http.put<TipoComprobante>(`${this.url}/${idTipoComprobante}`, cambios);
  }
}
