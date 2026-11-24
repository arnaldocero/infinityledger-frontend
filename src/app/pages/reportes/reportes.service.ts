import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Asiento, AsientoResumen } from '../asientos/models/asiento.model';

// Respuestas de /api/reportes. Los saldos tienen el signo de la naturaleza de la cuenta:
// positivo es saldo normal, negativo es saldo contrario.

export interface FilaCuenta {
  idCuenta: number;
  codigo: string;
  nombreCuenta: string;
  nivel: number;
  tipoCuenta: string;
  naturaleza: string;
  esMovimiento: boolean;
  saldoInicial: number;
  debitos: number;
  creditos: number;
  saldoFinal: number;
}

export interface SaldosMensuales {
  idPeriodo: number;
  periodo: string;
  /** true: período cerrado (saldos guardados). false: abierto (provisionales). */
  definitivo: boolean;
  filas: FilaCuenta[];
  totalDebitos: number;
  totalCreditos: number;
}

export interface LibroDiario {
  desde: string;
  hasta: string;
  asientos: Asiento[];
  totalDebe: number;
  totalHaber: number;
}

export interface MovimientoMayor {
  fecha: string;
  idAsiento: number;
  comprobante: string;
  concepto: string;
  codigoCuenta: string | null;
  nombreTercero: string | null;
  debe: number;
  haber: number;
  saldo: number;
}

export interface LibroMayor {
  idCuenta: number;
  codigo: string;
  nombreCuenta: string;
  naturaleza: string;
  desde: string;
  hasta: string;
  saldoInicial: number;
  movimientos: MovimientoMayor[];
  totalDebe: number;
  totalHaber: number;
  saldoFinal: number;
}

export interface BalanceComprobacion {
  desde: string;
  hasta: string;
  nivelMaximo: number;
  filas: FilaCuenta[];
  totalDebitos: number;
  totalCreditos: number;
  cuadra: boolean;
}

export interface FilaValor {
  idCuenta: number;
  codigo: string;
  nombreCuenta: string;
  nivel: number;
  esMovimiento: boolean;
  valor: number;
}

export interface Seccion {
  nombre: string;
  filas: FilaValor[];
  total: number;
}

export interface EstadoResultados {
  desde: string;
  hasta: string;
  ingresos: Seccion;
  costos: Seccion;
  gastos: Seccion;
  utilidadBruta: number;
  utilidadNeta: number;
}

export interface BalanceGeneral {
  fechaCorte: string;
  activo: Seccion;
  pasivo: Seccion;
  patrimonio: Seccion;
  resultadoEjercicio: number;
  resultadosAnteriores: number;
  totalPatrimonio: number;
  totalPasivoPatrimonio: number;
  cuadra: boolean;
  diferencia: number;
}

export interface PuntoMensual {
  mes: number;
  ingresos: number;
  gastos: number;
}

export interface Dashboard {
  fecha: string;
  periodo: string | null;
  estadoPeriodo: string | null;
  asientosPublicadosMes: number;
  borradores: number;
  efectivo: number;
  cuentasPorCobrar: number;
  cuentasPorPagar: number;
  ingresosAnio: number;
  gastosAnio: number;
  utilidadAnio: number;
  meses: PuntoMensual[];
  ultimosAsientos: AsientoResumen[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private url = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.url}/dashboard`);
  }

  saldosMensuales(idPeriodo: number): Observable<SaldosMensuales> {
    return this.http.get<SaldosMensuales>(`${this.url}/saldos-mensuales`, { params: { idPeriodo } });
  }

  libroDiario(desde: string, hasta: string): Observable<LibroDiario> {
    return this.http.get<LibroDiario>(`${this.url}/libro-diario`, { params: { desde, hasta } });
  }

  libroMayor(idCuenta: number, desde: string, hasta: string): Observable<LibroMayor> {
    return this.http.get<LibroMayor>(`${this.url}/libro-mayor`, { params: { idCuenta, desde, hasta } });
  }

  balanceComprobacion(desde: string, hasta: string, nivelMaximo: number): Observable<BalanceComprobacion> {
    return this.http.get<BalanceComprobacion>(`${this.url}/balance-comprobacion`, { params: { desde, hasta, nivelMaximo } });
  }

  estadoResultados(desde: string, hasta: string, nivelMaximo: number): Observable<EstadoResultados> {
    return this.http.get<EstadoResultados>(`${this.url}/estado-resultados`, { params: { desde, hasta, nivelMaximo } });
  }

  balanceGeneral(fechaCorte: string, nivelMaximo: number): Observable<BalanceGeneral> {
    return this.http.get<BalanceGeneral>(`${this.url}/balance-general`, { params: new HttpParams({ fromObject: { fechaCorte, nivelMaximo } }) });
  }
}
