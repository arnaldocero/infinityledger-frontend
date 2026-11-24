import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { exportarCsv } from '../../../@core/utils/exportar-csv';
import { hoy, inicioDeAnio } from '../../../@core/utils/fechas';
import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { EstadoResultados, ReportesService, Seccion } from '../reportes.service';

@Component({
  selector: 'ngx-estado-resultados',
  templateUrl: './estado-resultados.component.html',
  styleUrls: ['../reportes.scss'],
})
export class EstadoResultadosComponent {
  desde = inicioDeAnio();
  hasta = hoy();
  nivelMaximo = 4;

  datos: EstadoResultados | null = null;
  cargando = false;
  error = '';

  constructor(private reportes: ReportesService) {}

  get secciones(): Seccion[] {
    return this.datos ? [this.datos.ingresos, this.datos.costos, this.datos.gastos] : [];
  }

  consultar(): void {
    this.cargando = true;
    this.error = '';

    this.reportes.estadoResultados(this.desde, this.hasta, this.nivelMaximo).subscribe({
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
    for (const seccion of this.secciones) {
      filas.push(['', seccion.nombre.toUpperCase(), null]);
      seccion.filas.forEach(f => filas.push([f.codigo, f.nombreCuenta, f.valor]));
      filas.push(['', `Total ${seccion.nombre.toLowerCase()}`, seccion.total]);
    }
    filas.push(['', 'Utilidad bruta', this.datos.utilidadBruta], ['', 'Utilidad neta', this.datos.utilidadNeta]);
    exportarCsv(`estado-resultados-${this.datos.desde}-a-${this.datos.hasta}`, ['Código', 'Cuenta', 'Valor'], filas);
  }
}
