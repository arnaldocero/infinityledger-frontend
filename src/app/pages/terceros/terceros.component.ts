import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { mensajeDeError } from '../../@core/utils/mensaje-error';
import {
  TIPOS_DOCUMENTO,
  TIPOS_TERCERO,
  Tercero,
  TipoDocumento,
  TipoTercero,
  digitoVerificacion,
  documentoCompleto,
  esDocumentoNumerico,
  llevaDigitoVerificacion,
} from './models/tercero.model';
import { GuardarTercero, TercerosService } from './terceros.service';

@Component({
  selector: 'ngx-terceros',
  templateUrl: './terceros.component.html',
  styleUrls: ['./terceros.component.scss'],
})
export class TercerosComponent implements OnInit, OnDestroy {

  @ViewChild('dialogTercero') dialogTercero!: TemplateRef<any>;

  readonly tiposDocumento = TIPOS_DOCUMENTO;
  readonly tiposTercero = TIPOS_TERCERO;
  readonly documentoCompleto = documentoCompleto;

  terceros: Tercero[] = [];
  tercerosFiltrados: Tercero[] = [];
  textoBusqueda = '';
  filtroTipo: TipoTercero | '' = '';

  cargando = false;
  errorCarga = '';

  formTercero!: FormGroup;
  terceroSeleccionado: Tercero | null = null;
  guardando = false;
  errorGuardar = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private toastr: NbToastrService,
    private tercerosService: TercerosService,
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTerceros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inicializarFormulario(): void {
    this.formTercero = this.fb.group({
      tipoDocumento: ['NIT' as TipoDocumento, [Validators.required]],
      numeroDocumento: ['', [Validators.required, this.validarNumeroDocumento()]],
      nombreRazonSocial: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      tipos: this.fb.group(
        tiposMarcados(() => false),
        { validators: alMenosUnTipo },
      ),
      direccion: ['', [Validators.maxLength(200)]],
      telefono: ['', [Validators.maxLength(30)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      activo: [true],
    });

    // El formato válido del número depende del tipo de documento.
    this.formTercero.get('tipoDocumento')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.formTercero.get('numeroDocumento')!.updateValueAndValidity());
  }

  cargarTerceros(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.tercerosService.listar().subscribe({
      next: terceros => {
        this.terceros = terceros;
        this.filtrar();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  filtrar(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();

    this.tercerosFiltrados = this.terceros
      .filter(t => !this.filtroTipo || t.tiposTercero.includes(this.filtroTipo))
      .filter(t => !busqueda
        || t.nombreRazonSocial.toLowerCase().includes(busqueda)
        || t.numeroDocumento.toLowerCase().includes(busqueda))
      .sort((a, b) => a.nombreRazonSocial.localeCompare(b.nombreRazonSocial));
  }

  nombreTipoTercero(tipo: TipoTercero): string {
    return TIPOS_TERCERO.find(t => t.valor === tipo)?.nombre ?? tipo;
  }

  /** DV que se mostrará junto al NIT mientras se escribe; null si el tipo no lo lleva o el número aún no es válido. */
  get digitoFormulario(): number | null {
    const { tipoDocumento, numeroDocumento } = this.formTercero.value;
    return llevaDigitoVerificacion(tipoDocumento) ? digitoVerificacion((numeroDocumento || '').trim()) : null;
  }

  abrirModal(tercero?: Tercero): void {
    this.terceroSeleccionado = tercero ?? null;
    this.errorGuardar = '';
    this.guardando = false;

    this.formTercero.reset({
      tipoDocumento: tercero?.tipoDocumento ?? 'NIT',
      numeroDocumento: tercero?.numeroDocumento ?? '',
      nombreRazonSocial: tercero?.nombreRazonSocial ?? '',
      tipos: tiposMarcados(tipo => tercero ? tercero.tiposTercero.includes(tipo) : tipo === 'CLIENTE'),
      direccion: tercero?.direccion ?? '',
      telefono: tercero?.telefono ?? '',
      email: tercero?.email ?? '',
      activo: tercero?.activo ?? true,
    });

    this.dialogService.open(this.dialogTercero);
  }

  guardar(dialogRef: NbDialogRef<any>): void {
    if (this.formTercero.invalid || this.guardando) return;

    const datos = this.datosFormulario();
    const seleccionado = this.terceroSeleccionado;

    const peticion$: Observable<Tercero> = seleccionado
      ? this.tercerosService.editar(seleccionado.idTercero, datos)
      : this.tercerosService.crear(datos);

    this.guardando = true;
    this.errorGuardar = '';

    peticion$.subscribe({
      next: guardado => {
        this.terceros = seleccionado
          ? this.terceros.map(t => t.idTercero === guardado.idTercero ? guardado : t)
          : [...this.terceros, guardado];
        this.filtrar();
        this.guardando = false;
        dialogRef.close();
        this.toastr.success(guardado.nombreRazonSocial, seleccionado ? 'Tercero actualizado' : 'Tercero creado');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorGuardar = mensajeDeError(err);
      },
    });
  }

  private datosFormulario(): GuardarTercero {
    const v = this.formTercero.value;
    const vacioANull = (texto: string) => (texto || '').trim() || null;

    return {
      tipoDocumento: v.tipoDocumento,
      numeroDocumento: v.numeroDocumento.trim(),
      nombreRazonSocial: v.nombreRazonSocial.trim(),
      tiposTercero: TIPOS_TERCERO.map(t => t.valor).filter(tipo => v.tipos[tipo]),
      direccion: vacioANull(v.direccion),
      telefono: vacioANull(v.telefono),
      email: vacioANull(v.email),
      activo: v.activo,
    };
  }

  /** Mismo formato que exige la API: dígitos para NIT, RUT y CC; letras o dígitos para CE y pasaporte. */
  private validarNumeroDocumento(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const numero = ((control.value as string) || '').trim();
      const tipo = control.parent?.get('tipoDocumento')?.value as TipoDocumento | undefined;
      if (!numero || !tipo) return null;

      if (esDocumentoNumerico(tipo)) {
        return /^\d{5,15}$/.test(numero) ? null : { numerico: true };
      }
      return /^[A-Za-z0-9]{3,20}$/.test(numero) ? null : { alfanumerico: true };
    };
  }
}

/** Un booleano por tipo de tercero, para el grupo de casillas del formulario. */
function tiposMarcados(marcar: (tipo: TipoTercero) => boolean): Record<TipoTercero, boolean> {
  return TIPOS_TERCERO.reduce(
    (grupo, t) => ({ ...grupo, [t.valor]: marcar(t.valor) }),
    {} as Record<TipoTercero, boolean>,
  );
}

function alMenosUnTipo(grupo: AbstractControl): ValidationErrors | null {
  return Object.values(grupo.value).some(Boolean) ? null : { sinTipo: true };
}
