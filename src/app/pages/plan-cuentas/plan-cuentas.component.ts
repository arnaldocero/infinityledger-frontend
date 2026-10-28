import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NbDialogService, NbDialogRef, NbToastrService } from '@nebular/theme';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { mensajeDeError } from '../../@core/utils/mensaje-error';
import {
  CuentaContable,
  TIPOS_CUENTA,
  TipoCuenta,
  codigoPadre,
  nivelPorCodigo,
} from './models/cuenta.model';
import { CrearCuenta, EditarCuenta, PlanCuentasService } from './plan-cuentas.service';

@Component({
  selector: 'ngx-plan-cuentas',
  templateUrl: './plan-cuentas.component.html',
  styleUrls: ['./plan-cuentas.component.scss'],
})
export class PlanCuentasComponent implements OnInit, OnDestroy {

  @ViewChild('dialogCuenta') dialogCuenta!: TemplateRef<any>;

  readonly tiposCuenta = TIPOS_CUENTA;

  textoBusqueda: string = '';
  cuentas: CuentaContable[] = [];
  cuentasFiltradas: CuentaContable[] = [];

  cargando = false;
  errorCarga = '';

  // Variables para la Modal
  formCuenta!: FormGroup;
  cuentaSeleccionada: CuentaContable | null = null;
  guardando = false;
  errorGuardar = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private toastr: NbToastrService,
    private planCuentasService: PlanCuentasService,
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCuentas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inicializarFormulario(): void {
    this.formCuenta = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^\d+$/), this.validarCodigo()]],
      nombreCuenta: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      tipoCuenta: ['ACTIVO', [Validators.required]],
      naturaleza: ['DEBITO', [Validators.required]],
      esMovimiento: [true],
      pideTercero: [false],
      pideCentroCosto: [false],
      activo: [true],
    });

    // La naturaleza por defecto la define el tipo de cuenta (se puede cambiar a mano).
    this.formCuenta.get('tipoCuenta')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((tipo: TipoCuenta) => {
        const definicion = TIPOS_CUENTA.find(t => t.valor === tipo);
        if (definicion) {
          this.formCuenta.get('naturaleza')!.setValue(definicion.naturaleza, { emitEvent: false });
        }
      });

    // Una cuenta nueva hereda el tipo y la naturaleza de su cuenta padre (la API lo exige).
    this.formCuenta.get('codigo')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((codigo: string) => {
        if (this.cuentaSeleccionada) return;
        const padre = this.buscarPorCodigo(codigoPadre(codigo || ''));
        if (padre) {
          this.formCuenta.patchValue({ tipoCuenta: padre.tipoCuenta, naturaleza: padre.naturaleza }, { emitEvent: false });
        }
      });
  }

  cargarCuentas(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.planCuentasService.listar().subscribe({
      next: cuentas => {
        this.cuentas = cuentas;
        this.filtrarCuentas();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  filtrarCuentas(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    const ordenadas = [...this.cuentas].sort((a, b) => a.codigo.localeCompare(b.codigo));

    this.cuentasFiltradas = !busqueda ? ordenadas : ordenadas.filter(c =>
      c.codigo.toLowerCase().includes(busqueda) ||
      c.nombreCuenta.toLowerCase().includes(busqueda) ||
      this.nombreTipo(c.tipoCuenta).toLowerCase().includes(busqueda),
    );
  }

  nombreTipo(tipo: TipoCuenta): string {
    return TIPOS_CUENTA.find(t => t.valor === tipo)?.nombre ?? tipo;
  }

  getIndentacion(nivel: number): number {
    return (nivel - 1) * 20;
  }

  /** Nivel calculado a partir del código que se está escribiendo en el formulario. */
  get nivelFormulario(): number | null {
    return nivelPorCodigo(this.formCuenta.get('codigo')!.value || '');
  }

  // Abrir la ventana modal (Crear / Editar)
  abrirModalCuenta(cuenta?: CuentaContable): void {
    this.cuentaSeleccionada = cuenta ?? null;
    this.errorGuardar = '';
    this.guardando = false;

    this.formCuenta.reset({
      codigo: cuenta?.codigo ?? '',
      nombreCuenta: cuenta?.nombreCuenta ?? '',
      tipoCuenta: cuenta?.tipoCuenta ?? 'ACTIVO',
      naturaleza: cuenta?.naturaleza ?? 'DEBITO',
      esMovimiento: cuenta?.esMovimiento ?? true,
      pideTercero: cuenta?.pideTercero ?? false,
      pideCentroCosto: cuenta?.pideCentroCosto ?? false,
      activo: cuenta?.activo ?? true,
    }, { emitEvent: false });

    this.dialogService.open(this.dialogCuenta);
  }

  guardarCuenta(dialogRef: NbDialogRef<any>): void {
    if (this.formCuenta.invalid || this.guardando) return;

    const { codigo, ...cambios } = this.formCuenta.value as CrearCuenta;
    const seleccionada = this.cuentaSeleccionada;

    const peticion$: Observable<CuentaContable> = seleccionada
      ? this.planCuentasService.editar(seleccionada.idCuenta, cambios as EditarCuenta)
      : this.planCuentasService.crear({ codigo, ...cambios });

    this.guardando = true;
    this.errorGuardar = '';

    peticion$.subscribe({
      next: guardada => {
        this.cuentas = seleccionada
          ? this.cuentas.map(c => c.idCuenta === guardada.idCuenta ? guardada : c)
          : [...this.cuentas, guardada];
        this.filtrarCuentas();
        this.guardando = false;
        dialogRef.close();
        this.toastr.success(`${guardada.codigo} ${guardada.nombreCuenta}`, seleccionada ? 'Cuenta actualizada' : 'Cuenta creada');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorGuardar = mensajeDeError(err);
      },
    });
  }

  private buscarPorCodigo(codigo: string | null): CuentaContable | undefined {
    return codigo ? this.cuentas.find(c => c.codigo === codigo) : undefined;
  }

  /** Longitud válida del PUC, código no repetido y cuenta padre existente. La API vuelve a validarlo. */
  private validarCodigo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const codigo: string = control.value || '';
      if (!/^\d+$/.test(codigo)) return null; // lo reportan required / pattern

      if (nivelPorCodigo(codigo) === null) return { longitud: true };

      const repetida = this.cuentas.find(c => c.codigo === codigo);
      if (repetida && repetida.idCuenta !== this.cuentaSeleccionada?.idCuenta) return { duplicado: true };

      const padre = codigoPadre(codigo);
      if (padre && !this.buscarPorCodigo(padre)) return { sinPadre: padre };

      return null;
    };
  }
}
