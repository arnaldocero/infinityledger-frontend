import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Refleja la tabla `centros_costo` de la base de datos codeledger. */
export interface CentroCosto {
  idCentroCosto: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export type GuardarCentroCosto = Omit<CentroCosto, 'idCentroCosto'>;

@Injectable({
  providedIn: 'root',
})
export class CentrosCostoService {
  private url = `${environment.apiUrl}/centros-costo`;

  constructor(private http: HttpClient) {}

  listar(): Observable<CentroCosto[]> {
    return this.http.get<CentroCosto[]>(this.url);
  }

  crear(centro: GuardarCentroCosto): Observable<CentroCosto> {
    return this.http.post<CentroCosto>(this.url, centro);
  }

  editar(idCentroCosto: number, centro: GuardarCentroCosto): Observable<CentroCosto> {
    return this.http.put<CentroCosto>(`${this.url}/${idCentroCosto}`, centro);
  }
}
