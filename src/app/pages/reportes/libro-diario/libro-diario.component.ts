import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { exportarCsv } from '../../../@core/utils/exportar-csv';
import { hoy, inicioDeMes } from '../../../@core/utils/fechas';
import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { LibroDiario, ReportesService } from '../reportes.service';

@Component({
  selector: 'ngx-libro-diario',
  templateUrl: './libro-diario.component.html',
  styleUrls: ['../reportes.scss'],
})
export class LibroDiarioComponent {
  desde = inicioDeMes();
  hasta = hoy();

  datos: LibroDiario | null = null;
  cargando = false;
  error = '';

  constructor(private reportes: ReportesService) {}

  consultar(): void {
    this.cargando = true;
    this.error = '';

    this.reportes.libroDiario(this.desde, this.hasta).subscribe({
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
    const filas: (string | number | null)[][] = [];
    for (const a of this.datos.asientos) {
      for (const l of a.lineas) {
        filas.push([a.fechaAsiento, a.comprobante, a.conceptoGeneral, l.codigoCuenta, l.nombreCuenta,
          l.nombreTercero, l.concepto, l.debe || null, l.haber || null]);
      }
    }
    filas.push(['', '', 'TOTALES', '', '', null, null, this.datos.totalDebe, this.datos.totalHaber]);
    exportarCsv(`libro-diario-${this.datos.desde}-a-${this.datos.hasta}`,
      ['Fecha', 'Comprobante', 'Concepto', 'Código', 'Cuenta', 'Tercero', 'Detalle', 'Débito', 'Crédito'], filas);
  }
}
