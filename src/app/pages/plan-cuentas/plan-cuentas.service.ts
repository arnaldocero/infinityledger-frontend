import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CuentaContable, Naturaleza, TipoCuenta } from './models/cuenta.model';

/** Campos editables de una cuenta (PUT /api/plan-cuentas/{id}). El código y el nivel no cambian. */
export interface EditarCuenta {
  nombreCuenta: string;
  tipoCuenta: TipoCuenta;
  naturaleza: Naturaleza;
  esMovimiento: boolean;
  pideTercero: boolean;
  pideCentroCosto: boolean;
  activo: boolean;
}

/** POST /api/plan-cuentas. La API calcula el nivel y la cuenta padre a partir del código. */
export interface CrearCuenta extends EditarCuenta {
  codigo: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlanCuentasService {
  private url = `${environment.apiUrl}/plan-cuentas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<CuentaContable[]> {
    return this.http.get<CuentaContable[]>(this.url);
  }

  crear(cuenta: CrearCuenta): Observable<CuentaContable> {
    return this.http.post<CuentaContable>(this.url, cuenta);
  }

  editar(idCuenta: number, cambios: EditarCuenta): Observable<CuentaContable> {
    return this.http.put<CuentaContable>(`${this.url}/${idCuenta}`, cambios);
  }
}
