import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../@core/services/auth.service';
import { mensajeDeError } from '../../../@core/utils/mensaje-error';
import { CentroCosto, CentrosCostoService } from '../../centros-costo/centros-costo.service';
import { CuentaContable } from '../../plan-cuentas/models/cuenta.model';
import { PlanCuentasService } from '../../plan-cuentas/plan-cuentas.service';
import { Tercero, documentoCompleto } from '../../terceros/models/tercero.model';
import { TercerosService } from '../../terceros/terceros.service';
import { TipoComprobante, TiposComprobanteService } from '../../tipos-comprobante/tipos-comprobante.service';
import { AsientosService } from '../asientos.service';
import { Asiento, ESTADOS_ASIENTO, GuardarAsiento, LineaAsiento, redondear } from '../models/asiento.model';

/** Fecha local de hoy en formato 'aaaa-mm-dd' (el que usan el input date y la API). */
function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'ngx-asiento-editor',
  templateUrl: './asiento-editor.component.html',
  styleUrls: ['./asiento-editor.component.scss'],
})
export class AsientoEditorComponent implements OnInit {

  /** null mientras se crea un asiento nuevo. */
  asiento: Asiento | null = null;

  tipos: TipoComprobante[] = [];
  cuentas: CuentaContable[] = [];      // solo auxiliares activas
  terceros: Tercero[] = [];            // solo activos
  centros: CentroCosto[] = [];         // solo activos

  form!: FormGroup;
  cargando = false;
  errorCarga = '';
  guardando = false;
  errorGuardar = '';

  readonly puedeAnular: boolean;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: NbToastrService,
    private asientosService: AsientosService,
    private tiposService: TiposComprobanteService,
    private planCuentasService: PlanCuentasService,
    private tercerosService: TercerosService,
    private centrosService: CentrosCostoService,
    authService: AuthService,
  ) {
    const rol = authService.getRol();
    this.puedeAnular = rol === 'ADMIN' || rol === 'CONTADOR';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      idTipoComprobante: [null, [Validators.required]],
      fechaAsiento: [hoy(), [Validators.required]],
      conceptoGeneral: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
      lineas: this.fb.array([]),
    });
    this.cargar();
  }

  get lineas(): FormArray {
    return this.form.get('lineas') as FormArray;
  }

  get lineasGrupos(): FormGroup[] {
    return this.lineas.controls as FormGroup[];
  }

  /** Publicados y anulados solo se consultan. */
  get soloLectura(): boolean {
    return !!this.asiento && this.asiento.estado !== 'BORRADOR';
  }

  get titulo(): string {
    return this.asiento ? `Asiento ${this.asiento.comprobante}` : 'Nuevo Asiento';
  }

  get estadoAsiento() {
    return this.asiento ? ESTADOS_ASIENTO.find(e => e.valor === this.asiento!.estado)! : null;
  }

  get totalDebe(): number {
    return redondear(this.lineas.controls.reduce((suma, l) => suma + (Number(l.value.debe) || 0), 0));
  }

  get totalHaber(): number {
    return redondear(this.lineas.controls.reduce((suma, l) => suma + (Number(l.value.haber) || 0), 0));
  }

  get diferencia(): number {
    return redondear(this.totalDebe - this.totalHaber);
  }

  get cuadra(): boolean {
    return this.totalDebe > 0 && this.diferencia === 0;
  }

  readonly textoCuenta = (c: CuentaContable) => `${c.codigo} - ${c.nombreCuenta}`;
  readonly textoTercero = (t: Tercero) => `${documentoCompleto(t)} - ${t.nombreRazonSocial}`;

  cargar(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargando = true;
    this.errorCarga = '';

    forkJoin({
      tipos: this.tiposService.listar(),
      cuentas: this.planCuentasService.listar(),
      terceros: this.tercerosService.listar(),
      centros: this.centrosService.listar(),
    }).subscribe({
      next: catalogos => {
        this.tipos = catalogos.tipos;
        this.cuentas = catalogos.cuentas.filter(c => c.esMovimiento && c.activo);
        this.terceros = catalogos.terceros.filter(t => t.activo);
        this.centros = catalogos.centros.filter(c => c.activo);

        if (id) {
          this.cargarAsiento(id);
        } else {
          this.form.patchValue({ idTipoComprobante: this.tipos[0]?.idTipoComprobante ?? null });
          this.agregarLinea();
          this.agregarLinea();
          this.cargando = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  agregarLinea(linea?: LineaAsiento): void {
    const cuenta = linea ? this.cuentas.find(c => c.idCuenta === linea.idCuenta) : undefined;
    const tercero = linea?.idTercero ? this.terceros.find(t => t.idTercero === linea.idTercero) : undefined;

    this.lineas.push(this.fb.group({
      cuenta: [cuenta ? this.textoCuenta(cuenta) : linea ? `${linea.codigoCuenta} - ${linea.nombreCuenta}` : ''],
      idCuenta: [cuenta?.idCuenta ?? null],
      tercero: [tercero ? this.textoTercero(tercero) : linea?.nombreTercero ?? ''],
      idTercero: [tercero?.idTercero ?? null],
      idCentroCosto: [linea?.idCentroCosto ?? null],
      concepto: [linea?.concepto ?? '', [Validators.maxLength(255)]],
      debe: [linea?.debe || null, [Validators.min(0)]],
      haber: [linea?.haber || null, [Validators.min(0)]],
    }, { validators: this.validarLinea() }));
  }

  quitarLinea(indice: number): void {
    if (this.lineas.length > 1) {
      this.lineas.removeAt(indice);
    }
  }

  /** Convierte el texto escrito (código o 'código - nombre') en la cuenta auxiliar elegida. */
  alCambiarCuenta(indice: number): void {
    const linea = this.lineasGrupos[indice];
    const texto = ((linea.value.cuenta as string) || '').trim();
    const cuenta = this.cuentas.find(c => this.textoCuenta(c) === texto || c.codigo === texto);

    linea.patchValue({ idCuenta: cuenta?.idCuenta ?? null, cuenta: cuenta ? this.textoCuenta(cuenta) : texto });
  }

  alCambiarTercero(indice: number): void {
    const linea = this.lineasGrupos[indice];
    const texto = ((linea.value.tercero as string) || '').trim();
    const tercero = this.terceros.find(t => this.textoTercero(t) === texto || t.numeroDocumento === texto);

    linea.patchValue({ idTercero: tercero?.idTercero ?? null, tercero: tercero ? this.textoTercero(tercero) : texto });
  }

  /** Débito y crédito son excluyentes en una línea: escribir uno limpia el otro. */
  alEscribirValor(indice: number, campo: 'debe' | 'haber'): void {
    const linea = this.lineasGrupos[indice];
    if (Number(linea.value[campo]) > 0) {
      linea.patchValue({ [campo === 'debe' ? 'haber' : 'debe']: null });
    }
  }

  cuentaDe(linea: FormGroup): CuentaContable | undefined {
    return this.cuentas.find(c => c.idCuenta === linea.value.idCuenta);
  }

  guardar(publicar: boolean): void {
    if (this.guardando || this.soloLectura) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorGuardar = 'Revise los campos marcados en rojo.';
      return;
    }

    if (publicar && !this.cuadra) {
      this.errorGuardar = 'Para publicar, los débitos y los créditos deben ser iguales.';
      return;
    }

    const datos = this.datosFormulario(publicar);
    const existente = this.asiento;
    const peticion$ = existente
      ? this.asientosService.editar(existente.idAsiento, datos)
      : this.asientosService.crear(datos);

    this.guardando = true;
    this.errorGuardar = '';

    peticion$.subscribe({
      next: guardado => {
        this.guardando = false;
        if (publicar) {
          this.toastr.success(`${guardado.comprobante} publicado`, 'Asiento contable');
          this.router.navigate(['/pages/asientos']);
        } else {
          this.toastr.success(`${guardado.comprobante} guardado como borrador`, 'Asiento contable');
          this.asiento = guardado;
          if (!existente) {
            this.router.navigate(['/pages/asientos', guardado.idAsiento], { replaceUrl: true });
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorGuardar = mensajeDeError(err);
      },
    });
  }

  anular(): void {
    const asiento = this.asiento;
    if (!asiento || this.guardando) return;
    if (!this.confirmar(`¿Anular el asiento ${asiento.comprobante}? El número quedará usado y no se puede deshacer.`)) return;

    this.guardando = true;
    this.errorGuardar = '';

    this.asientosService.anular(asiento.idAsiento).subscribe({
      next: anulado => {
        this.guardando = false;
        this.asiento = anulado;
        this.toastr.success(`${anulado.comprobante} anulado`, 'Asiento contable');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorGuardar = mensajeDeError(err);
      },
    });
  }

  /** Separado para poder simularlo en las pruebas. */
  confirmar(mensaje: string): boolean {
    return window.confirm(mensaje);
  }

  private cargarAsiento(id: number): void {
    this.asientosService.obtener(id).subscribe({
      next: asiento => {
        this.asiento = asiento;
        this.form.patchValue({
          idTipoComprobante: asiento.idTipoComprobante,
          fechaAsiento: asiento.fechaAsiento,
          conceptoGeneral: asiento.conceptoGeneral,
        });
        // El número ya está asignado: el tipo de comprobante no se puede cambiar.
        this.form.get('idTipoComprobante')!.disable();
        asiento.lineas.forEach(l => this.agregarLinea(l));
        if (asiento.lineas.length === 0) this.agregarLinea();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  private datosFormulario(publicar: boolean): GuardarAsiento {
    const v = this.form.getRawValue();
    return {
      idTipoComprobante: v.idTipoComprobante,
      fechaAsiento: v.fechaAsiento,
      conceptoGeneral: v.conceptoGeneral.trim(),
      publicar,
      lineas: v.lineas.map((l: any) => ({
        idCuenta: l.idCuenta,
        idTercero: l.idTercero,
        idCentroCosto: l.idCentroCosto,
        concepto: (l.concepto || '').trim() || null,
        debe: redondear(Number(l.debe) || 0),
        haber: redondear(Number(l.haber) || 0),
      })),
    };
  }

  /**
   * Reglas de cada línea, iguales a las de la API: cuenta auxiliar elegida, valor en débito o en
   * crédito (no ambos) y tercero o centro de costo cuando la cuenta los exige.
   */
  private validarLinea(): ValidatorFn {
    return (grupo: AbstractControl): ValidationErrors | null => {
      const v = grupo.value;
      const errores: ValidationErrors = {};
      const cuenta = this.cuentas.find(c => c.idCuenta === v.idCuenta);

      if (!cuenta) errores['cuenta'] = true;
      if ((Number(v.debe) > 0) === (Number(v.haber) > 0)) errores['valor'] = true;
      if (cuenta?.pideTercero && !v.idTercero) errores['tercero'] = true;
      if (cuenta?.pideCentroCosto && !v.idCentroCosto) errores['centro'] = true;

      return Object.keys(errores).length ? errores : null;
    };
  }
}
