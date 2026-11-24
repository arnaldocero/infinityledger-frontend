import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { exportarCsv } from '../../../@core/utils/exportar-csv';
import { hoy, inicioDeMes } from '../../../@core/utils/fechas';
import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { CuentaContable } from '../../plan-cuentas/models/cuenta.model';
import { PlanCuentasService } from '../../plan-cuentas/plan-cuentas.service';
import { LibroMayor, ReportesService } from '../reportes.service';

@Component({
  selector: 'ngx-libro-mayor',
  templateUrl: './libro-mayor.component.html',
  styleUrls: ['../reportes.scss'],
})
export class LibroMayorComponent implements OnInit {
  desde = inicioDeMes();
  hasta = hoy();

  /** Todas las cuentas: una mayor trae los movimientos de sus subcuentas. */
  cuentas: CuentaContable[] = [];
  textoCuenta = '';

  datos: LibroMayor | null = null;
  cargando = false;
  error = '';

  readonly etiqueta = (c: CuentaContable) => `${c.codigo} - ${c.nombreCuenta}`;

  constructor(
    private reportes: ReportesService,
    private planCuentas: PlanCuentasService,
  ) {}

  ngOnInit(): void {
    this.planCuentas.listar().subscribe({
      next: cuentas => this.cuentas = cuentas,
      error: (err: HttpErrorResponse) => this.error = mensajeDeError(err),
    });
  }

  /** Cuenta elegida en el buscador, por código o por 'código - nombre'. */
  get cuentaElegida(): CuentaContable | undefined {
    const texto = this.textoCuenta.trim();
    return this.cuentas.find(c => this.etiqueta(c) === texto || c.codigo === texto);
  }

  consultar(): void {
    const cuenta = this.cuentaElegida;
    if (!cuenta) {
      this.error = 'Elija una cuenta de la lista.';
      return;
    }

    this.textoCuenta = this.etiqueta(cuenta);
    this.cargando = true;
    this.error = '';

    this.reportes.libroMayor(cuenta.idCuenta, this.desde, this.hasta).subscribe({
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
    exportarCsv(`libro-mayor-${d.codigo}-${d.desde}-a-${d.hasta}`,
      ['Fecha', 'Comprobante', 'Concepto', 'Subcuenta', 'Tercero', 'Débito', 'Crédito', 'Saldo'],
      [
        ['', '', 'Saldo inicial', '', '', null, null, d.saldoInicial],
        ...d.movimientos.map(m => [m.fecha, m.comprobante, m.concepto, m.codigoCuenta, m.nombreTercero, m.debe || null, m.haber || null, m.saldo]),
        ['', '', 'TOTALES', '', '', d.totalDebe, d.totalHaber, d.saldoFinal],
      ]);
  }
}
