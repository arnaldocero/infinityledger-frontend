import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { Observable } from 'rxjs';

import { AuthService } from '../../@core/services/auth.service';
import { mensajeDeError } from '../../@core/utils/mensaje-error';
import { NOMBRES_MES, Periodo, PeriodosService, nombrePeriodo } from './periodos.service';

/** Cerrar o reabrir, pendiente de confirmar en el diálogo. */
interface AccionPendiente {
  tipo: 'cerrar' | 'reabrir';
  periodo: Periodo;
}

@Component({
  selector: 'ngx-periodos',
  templateUrl: './periodos.component.html',
  styleUrls: ['./periodos.component.scss'],
})
export class PeriodosComponent implements OnInit {

  @ViewChild('dialogConfirmar') dialogConfirmar!: TemplateRef<any>;

  readonly meses = NOMBRES_MES;
  readonly nombrePeriodo = nombrePeriodo;

  periodos: Periodo[] = [];
  cargando = false;
  errorCarga = '';

  // Formulario superior para crear un mes o un año completo
  anioNuevo = new Date().getFullYear();
  mesNuevo = new Date().getMonth() + 1;
  creando = false;
  errorCrear = '';

  accion: AccionPendiente | null = null;
  ejecutando = false;
  errorAccion = '';

  /** Solo el ADMIN reabre períodos (la API lo exige igual). */
  readonly puedeReabrir: boolean;

  constructor(
    private periodosService: PeriodosService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService,
    authService: AuthService,
  ) {
    this.puedeReabrir = authService.getRol() === 'ADMIN';
  }

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.periodosService.listar().subscribe({
      next: periodos => {
        this.periodos = periodos;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  get anioValido(): boolean {
    return Number.isInteger(this.anioNuevo) && this.anioNuevo >= 2000 && this.anioNuevo <= 2100;
  }

  crearMes(): void {
    this.ejecutarCreacion(
      () => this.periodosService.crear(this.anioNuevo, this.mesNuevo),
      creado => `Se creó ${nombrePeriodo(creado)}.`,
    );
  }

  generarAnio(): void {
    this.ejecutarCreacion(
      () => this.periodosService.generarAnio(this.anioNuevo),
      creados => `Se crearon ${creados.length} período(s) de ${this.anioNuevo}.`,
    );
  }

  confirmar(tipo: AccionPendiente['tipo'], periodo: Periodo): void {
    this.accion = { tipo, periodo };
    this.errorAccion = '';
    this.ejecutando = false;
    this.dialogService.open(this.dialogConfirmar);
  }

  ejecutarAccion(dialogRef: NbDialogRef<any>): void {
    if (!this.accion || this.ejecutando) return;
    const { tipo, periodo } = this.accion;

    const peticion$ = tipo === 'cerrar'
      ? this.periodosService.cerrar(periodo.idPeriodo)
      : this.periodosService.reabrir(periodo.idPeriodo);

    this.ejecutando = true;
    this.errorAccion = '';

    peticion$.subscribe({
      next: actualizado => {
        this.periodos = this.periodos.map(p => p.idPeriodo === actualizado.idPeriodo ? actualizado : p);
        this.ejecutando = false;
        dialogRef.close();
        this.toastr.success(nombrePeriodo(actualizado), tipo === 'cerrar' ? 'Período cerrado' : 'Período reabierto');
      },
      error: (err: HttpErrorResponse) => {
        this.ejecutando = false;
        this.errorAccion = mensajeDeError(err);
      },
    });
  }

  /** Recibe una función para no armar la petición si el año no es válido. */
  private ejecutarCreacion<T extends Periodo | Periodo[]>(peticion: () => Observable<T>, mensaje: (creado: T) => string): void {
    if (!this.anioValido || this.creando) return;

    this.creando = true;
    this.errorCrear = '';

    peticion().subscribe({
      next: creado => {
        this.creando = false;
        this.toastr.success(mensaje(creado), 'Períodos');
        this.cargarPeriodos();
      },
      error: (err: HttpErrorResponse) => {
        this.creando = false;
        this.errorCrear = mensajeDeError(err);
      },
    });
  }
}
