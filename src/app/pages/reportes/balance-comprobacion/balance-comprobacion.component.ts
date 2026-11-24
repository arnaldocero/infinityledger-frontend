import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { exportarCsv } from '../../../@core/utils/exportar-csv';
import { hoy, inicioDeMes } from '../../../@core/utils/fechas';
import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { BalanceComprobacion, ReportesService } from '../reportes.service';

@Component({
  selector: 'ngx-balance-comprobacion',
  templateUrl: './balance-comprobacion.component.html',
  styleUrls: ['../reportes.scss'],
})
export class BalanceComprobacionComponent {
  desde = inicioDeMes();
  hasta = hoy();
  nivelMaximo = 4;

  datos: BalanceComprobacion | null = null;
  cargando = false;
  error = '';

  constructor(private reportes: ReportesService) {}

  consultar(): void {
    this.cargando = true;
    this.error = '';

    this.reportes.balanceComprobacion(this.desde, this.hasta, this.nivelMaximo).subscribe({
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
    exportarCsv(`balance-comprobacion-${this.datos.desde}-a-${this.datos.hasta}`,
      ['Código', 'Cuenta', 'Saldo inicial', 'Débitos', 'Créditos', 'Saldo final'],
      [
        ...this.datos.filas.map(f => [f.codigo, f.nombreCuenta, f.saldoInicial, f.debitos, f.creditos, f.saldoFinal]),
        ['', 'TOTALES', null, this.datos.totalDebitos, this.datos.totalCreditos, null],
      ]);
  }
}
