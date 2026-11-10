import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { Periodo, PeriodosService, nombrePeriodo } from '../../periodos/periodos.service';
import { AsientosService } from '../asientos.service';
import { AsientoResumen, ESTADOS_ASIENTO, EstadoAsiento } from '../models/asiento.model';

@Component({
  selector: 'ngx-asientos-lista',
  templateUrl: './asientos-lista.component.html',
  styleUrls: ['./asientos-lista.component.scss'],
})
export class AsientosListaComponent implements OnInit {

  readonly estados = ESTADOS_ASIENTO;
  readonly nombrePeriodo = nombrePeriodo;

  asientos: AsientoResumen[] = [];
  periodos: Periodo[] = [];
  filtroPeriodo: number | null = null;
  filtroEstado: EstadoAsiento | '' = '';

  cargando = false;
  errorCarga = '';

  constructor(
    private asientosService: AsientosService,
    private periodosService: PeriodosService,
  ) {}

  ngOnInit(): void {
    // Los períodos solo alimentan el filtro; si fallan, el listado igual se muestra.
    this.periodosService.listar().subscribe({ next: periodos => this.periodos = periodos, error: () => {} });
    this.cargarAsientos();
  }

  cargarAsientos(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.asientosService.listar({ idPeriodo: this.filtroPeriodo, estado: this.filtroEstado }).subscribe({
      next: asientos => {
        this.asientos = asientos;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  estado(valor: EstadoAsiento) {
    return ESTADOS_ASIENTO.find(e => e.valor === valor)!;
  }
}
