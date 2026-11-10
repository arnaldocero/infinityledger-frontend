import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type EstadoPeriodo = 'ABIERTO' | 'CERRADO';

/** Refleja la tabla `periodos_fiscales`. Las fechas llegan como 'aaaa-mm-dd'. */
export interface Periodo {
  idPeriodo: number;
  anio: number;
  mes: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodo;
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** 'Octubre 2026'. */
export function nombrePeriodo(p: Pick<Periodo, 'anio' | 'mes'>): string {
  const mes = MESES[p.mes - 1];
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${p.anio}`;
}

export const NOMBRES_MES = MESES.map((nombre, i) => ({ valor: i + 1, nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1) }));

@Injectable({
  providedIn: 'root',
})
export class PeriodosService {
  private url = `${environment.apiUrl}/periodos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(this.url);
  }

  crear(anio: number, mes: number): Observable<Periodo> {
    return this.http.post<Periodo>(this.url, { anio, mes });
  }

  /** Crea los meses que falten del año y devuelve solo los creados. */
  generarAnio(anio: number): Observable<Periodo[]> {
    return this.http.post<Periodo[]>(`${this.url}/anio/${anio}`, null);
  }

  cerrar(idPeriodo: number): Observable<Periodo> {
    return this.http.post<Periodo>(`${this.url}/${idPeriodo}/cerrar`, null);
  }

  reabrir(idPeriodo: number): Observable<Periodo> {
    return this.http.post<Periodo>(`${this.url}/${idPeriodo}/reabrir`, null);
  }
}
