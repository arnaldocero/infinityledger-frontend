import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import {
  CuentaContable,
  TIPOS_CUENTA,
  TipoCuenta,
  codigoPadre,
  nivelPorCodigo,
} from './models/cuenta.model';

@Component({
  selector: 'ngx-plan-cuentas',
  templateUrl: './plan-cuentas.component.html',
  styleUrls: ['./plan-cuentas.component.scss'],
})
export class PlanCuentasComponent implements OnInit {

  @ViewChild('dialogCuenta') dialogCuenta!: TemplateRef<any>;

  readonly tiposCuenta = TIPOS_CUENTA;

  textoBusqueda: string = '';
  cuentas: CuentaContable[] = [];
  cuentasFiltradas: CuentaContable[] = [];

  // Variables para la Modal
  formCuenta!: FormGroup;
  cuentaSeleccionada: CuentaContable | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCuentasEjemplo();
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
    this.formCuenta.get('tipoCuenta')!.valueChanges.subscribe((tipo: TipoCuenta) => {
      const definicion = TIPOS_CUENTA.find(t => t.valor === tipo);
      if (definicion) {
        this.formCuenta.get('naturaleza')!.setValue(definicion.naturaleza, { emitEvent: false });
      }
    });
  }

  // TODO Fase 3: reemplazar por GET /api/plan-cuentas. Copia de la tabla plan_cuentas (empresa 1).
  cargarCuentasEjemplo(): void {
    this.cuentas = [
      { idCuenta: 1, codigo: '1', nombreCuenta: 'ACTIVO', idCuentaPadre: null, nivel: 1, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 2, codigo: '11', nombreCuenta: 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', idCuentaPadre: 1, nivel: 2, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 3, codigo: '1105', nombreCuenta: 'CAJA', idCuentaPadre: 2, nivel: 3, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 4, codigo: '110505', nombreCuenta: 'Caja General', idCuentaPadre: 3, nivel: 4, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: true, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 5, codigo: '1110', nombreCuenta: 'BANCOS', idCuentaPadre: 2, nivel: 3, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 6, codigo: '111005', nombreCuenta: 'Bancos Nacionales - M/N', idCuentaPadre: 5, nivel: 4, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: true, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 7, codigo: '13', nombreCuenta: 'CUENTAS POR COBRAR (CLIENTES)', idCuentaPadre: 1, nivel: 2, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 21, codigo: '1305', nombreCuenta: 'CLIENTES', idCuentaPadre: 7, nivel: 3, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 8, codigo: '130505', nombreCuenta: 'Clientes Nacionales', idCuentaPadre: 21, nivel: 4, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: true, pideTercero: true, pideCentroCosto: false, activo: true },
      { idCuenta: 9, codigo: '2', nombreCuenta: 'PASIVO', idCuentaPadre: null, nivel: 1, tipoCuenta: 'PASIVO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 10, codigo: '22', nombreCuenta: 'PROVEEDORES', idCuentaPadre: 9, nivel: 2, tipoCuenta: 'PASIVO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 22, codigo: '2205', nombreCuenta: 'NACIONALES', idCuentaPadre: 10, nivel: 3, tipoCuenta: 'PASIVO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 11, codigo: '220505', nombreCuenta: 'Proveedores Nacionales', idCuentaPadre: 22, nivel: 4, tipoCuenta: 'PASIVO', naturaleza: 'CREDITO', esMovimiento: true, pideTercero: true, pideCentroCosto: false, activo: true },
      { idCuenta: 12, codigo: '3', nombreCuenta: 'PATRIMONIO', idCuentaPadre: null, nivel: 1, tipoCuenta: 'PATRIMONIO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 13, codigo: '31', nombreCuenta: 'CAPITAL SOCIAL', idCuentaPadre: 12, nivel: 2, tipoCuenta: 'PATRIMONIO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 23, codigo: '3105', nombreCuenta: 'CAPITAL SUSCRITO Y PAGADO', idCuentaPadre: 13, nivel: 3, tipoCuenta: 'PATRIMONIO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 14, codigo: '310505', nombreCuenta: 'Capital Suscrito y Pagado', idCuentaPadre: 23, nivel: 4, tipoCuenta: 'PATRIMONIO', naturaleza: 'CREDITO', esMovimiento: true, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 15, codigo: '4', nombreCuenta: 'INGRESOS', idCuentaPadre: null, nivel: 1, tipoCuenta: 'INGRESO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 16, codigo: '41', nombreCuenta: 'OPERACIONALES', idCuentaPadre: 15, nivel: 2, tipoCuenta: 'INGRESO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 24, codigo: '4135', nombreCuenta: 'COMERCIO AL POR MAYOR Y AL POR MENOR', idCuentaPadre: 16, nivel: 3, tipoCuenta: 'INGRESO', naturaleza: 'CREDITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 17, codigo: '413505', nombreCuenta: 'Venta de Software y Servicios TI', idCuentaPadre: 24, nivel: 4, tipoCuenta: 'INGRESO', naturaleza: 'CREDITO', esMovimiento: true, pideTercero: true, pideCentroCosto: false, activo: true },
      { idCuenta: 18, codigo: '5', nombreCuenta: 'GASTOS', idCuentaPadre: null, nivel: 1, tipoCuenta: 'GASTO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 19, codigo: '51', nombreCuenta: 'ADMINISTRATIVOS', idCuentaPadre: 18, nivel: 2, tipoCuenta: 'GASTO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 25, codigo: '5135', nombreCuenta: 'SERVICIOS', idCuentaPadre: 19, nivel: 3, tipoCuenta: 'GASTO', naturaleza: 'DEBITO', esMovimiento: false, pideTercero: false, pideCentroCosto: false, activo: true },
      { idCuenta: 20, codigo: '513505', nombreCuenta: 'Servicios Públicos e Internet', idCuentaPadre: 25, nivel: 4, tipoCuenta: 'GASTO', naturaleza: 'DEBITO', esMovimiento: true, pideTercero: true, pideCentroCosto: false, activo: true },
    ];

    this.filtrarCuentas();
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

  // Guardar (Agregar o Modificar en memoria)
  guardarCuenta(dialogRef: NbDialogRef<any>): void {
    if (this.formCuenta.invalid) return;

    const datos = this.formCuenta.value;
    const padre = this.buscarPorCodigo(codigoPadre(datos.codigo));

    const cuenta: CuentaContable = {
      ...datos,
      idCuenta: this.cuentaSeleccionada?.idCuenta ?? this.siguienteId(),
      nivel: nivelPorCodigo(datos.codigo)!,
      idCuentaPadre: padre?.idCuenta ?? null,
    };

    if (this.cuentaSeleccionada) {
      this.cuentas = this.cuentas.map(c => c.idCuenta === cuenta.idCuenta ? cuenta : c);
    } else {
      this.cuentas = [...this.cuentas, cuenta];
    }

    this.filtrarCuentas();
    dialogRef.close();
  }

  private buscarPorCodigo(codigo: string | null): CuentaContable | undefined {
    return codigo ? this.cuentas.find(c => c.codigo === codigo) : undefined;
  }

  private siguienteId(): number {
    return Math.max(0, ...this.cuentas.map(c => c.idCuenta ?? 0)) + 1;
  }

  /** Longitud válida del PUC, código no repetido y cuenta padre existente. */
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
