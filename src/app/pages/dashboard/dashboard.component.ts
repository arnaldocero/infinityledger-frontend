import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService, UsuarioSesion } from '../../@core/services/auth.service';
import { mensajeDeError } from '../../@core/utils/mensaje-error';
import { ESTADOS_ASIENTO, EstadoAsiento } from '../asientos/models/asiento.model';
import { Dashboard, ReportesService } from '../reportes/reportes.service';

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  readonly mesesCortos = MESES_CORTOS;

  usuario: UsuarioSesion | null;
  datos: Dashboard | null = null;
  cargando = false;
  error = '';

  constructor(authService: AuthService, private reportes: ReportesService) {
    this.usuario = authService.getUsuario();
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';

    this.reportes.dashboard().subscribe({
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

  /** Valor más alto del año, para escalar las barras de la gráfica. */
  get maximoMensual(): number {
    if (!this.datos) return 0;
    return Math.max(0, ...this.datos.meses.map(m => Math.max(m.ingresos, m.gastos)));
  }

  /** Alto de una barra en porcentaje; los valores negativos no se dibujan. */
  alto(valor: number): number {
    const maximo = this.maximoMensual;
    return maximo > 0 && valor > 0 ? Math.max(2, (valor / maximo) * 100) : 0;
  }

  estado(valor: EstadoAsiento) {
    return ESTADOS_ASIENTO.find(e => e.valor === valor)!;
  }
}
