import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Tercero, TipoDocumento, TipoTercero } from './models/tercero.model';

/** Cuerpo de POST /api/terceros y PUT /api/terceros/{id}. La API calcula el dígito de verificación. */
export interface GuardarTercero {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombreRazonSocial: string;
  tiposTercero: TipoTercero[];
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TercerosService {
  private url = `${environment.apiUrl}/terceros`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Tercero[]> {
    return this.http.get<Tercero[]>(this.url);
  }

  crear(tercero: GuardarTercero): Observable<Tercero> {
    return this.http.post<Tercero>(this.url, tercero);
  }

  editar(idTercero: number, tercero: GuardarTercero): Observable<Tercero> {
    return this.http.put<Tercero>(`${this.url}/${idTercero}`, tercero);
  }
}
