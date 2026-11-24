import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { exportarCsv } from '../../../@core/utils/exportar-csv';
import { hoy } from '../../../@core/utils/fechas';
import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { BalanceGeneral, ReportesService, Seccion } from '../reportes.service';

@Component({
  selector: 'ngx-balance-general',
  templateUrl: './balance-general.component.html',
  styleUrls: ['../reportes.scss'],
})
export class BalanceGeneralComponent {
  fechaCorte = hoy();
  nivelMaximo = 2;

  datos: BalanceGeneral | null = null;
  cargando = false;
  error = '';

  constructor(private reportes: ReportesService) {}

  get secciones(): Seccion[] {
    return this.datos ? [this.datos.activo, this.datos.pasivo, this.datos.patrimonio] : [];
  }

  consultar(): void {
    this.cargando = true;
    this.error = '';

    this.reportes.balanceGeneral(this.fechaCorte, this.nivelMaximo).subscribe({
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
    const d = this.datos;
    const filas: (string | number | null)[][] = [];
    for (const seccion of this.secciones) {
      filas.push(['', seccion.nombre.toUpperCase(), null]);
      seccion.filas.forEach(f => filas.push([f.codigo, f.nombreCuenta, f.valor]));
      filas.push(['', `Total ${seccion.nombre.toLowerCase()}`, seccion.total]);
    }
    filas.push(
      ['', 'Resultado del ejercicio', d.resultadoEjercicio],
      ['', 'Resultados de ejercicios anteriores', d.resultadosAnteriores],
      ['', 'Total patrimonio', d.totalPatrimonio],
      ['', 'Total pasivo + patrimonio', d.totalPasivoPatrimonio],
    );
    exportarCsv(`balance-general-${d.fechaCorte}`, ['Código', 'Cuenta', 'Valor'], filas);
  }
}
