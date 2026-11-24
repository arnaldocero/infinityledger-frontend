import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { exportarCsv } from '../../../@core/utils/exportar-csv';
import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { Periodo, PeriodosService, nombrePeriodo } from '../../periodos/periodos.service';
import { ReportesService, SaldosMensuales } from '../reportes.service';

@Component({
  selector: 'ngx-saldos-mensuales',
  templateUrl: './saldos-mensuales.component.html',
  styleUrls: ['../reportes.scss'],
})
export class SaldosMensualesComponent implements OnInit {
  readonly nombrePeriodo = nombrePeriodo;

  periodos: Periodo[] = [];
  idPeriodo: number | null = null;

  datos: SaldosMensuales | null = null;
  cargando = false;
  error = '';

  constructor(
    private reportes: ReportesService,
    private periodosService: PeriodosService,
  ) {}

  ngOnInit(): void {
    this.periodosService.listar().subscribe({
      next: periodos => {
        this.periodos = periodos;
        // Por defecto, el período más reciente.
        this.idPeriodo = periodos[0]?.idPeriodo ?? null;
      },
      error: (err: HttpErrorResponse) => this.error = mensajeDeError(err),
    });
  }

  consultar(): void {
    if (!this.idPeriodo) return;
    this.cargando = true;
    this.error = '';

    this.reportes.saldosMensuales(this.idPeriodo).subscribe({
      next: datos => {
        this.datos = datos;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  imprimir(): void {
    window.print();
  }

  exportar(): void {
    if (!this.datos) return;
    exportarCsv(`saldos-${this.datos.periodo.replace(' ', '-')}`,
      ['Código', 'Cuenta', 'Saldo inicial', 'Débitos', 'Créditos', 'Saldo final'],
      this.datos.filas.map(f => [f.codigo, f.nombreCuenta, f.saldoInicial, f.debitos, f.creditos, f.saldoFinal]));
  }
}
