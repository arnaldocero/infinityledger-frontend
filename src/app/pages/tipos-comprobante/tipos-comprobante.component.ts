import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { Observable } from 'rxjs';

import { mensajeDeError } from '../../@core/utils/mensaje-error';
import { TipoComprobante, TiposComprobanteService } from './tipos-comprobante.service';

@Component({
  selector: 'ngx-tipos-comprobante',
  templateUrl: './tipos-comprobante.component.html',
  styleUrls: ['./tipos-comprobante.component.scss'],
})
export class TiposComprobanteComponent implements OnInit {

  @ViewChild('dialogTipo') dialogTipo!: TemplateRef<any>;

  tipos: TipoComprobante[] = [];
  cargando = false;
  errorCarga = '';

  formTipo!: FormGroup;
  tipoSeleccionado: TipoComprobante | null = null;
  guardando = false;
  errorGuardar = '';

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private toastr: NbToastrService,
    private tiposService: TiposComprobanteService,
  ) {}

  ngOnInit(): void {
    this.formTipo = this.fb.group({
      // Mismo formato que exige la API, que lo guarda en mayúsculas.
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2,10}$/)]],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      consecutivoActual: [1, [Validators.required, Validators.min(1)]],
    });
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.tiposService.listar().subscribe({
      next: tipos => {
        this.tipos = tipos;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  abrirModal(tipo?: TipoComprobante): void {
    this.tipoSeleccionado = tipo ?? null;
    this.errorGuardar = '';
    this.guardando = false;
    this.formTipo.reset({
      codigo: tipo?.codigo ?? '',
      nombre: tipo?.nombre ?? '',
      consecutivoActual: tipo?.consecutivoActual ?? 1,
    });
    this.dialogService.open(this.dialogTipo);
  }

  guardar(dialogRef: NbDialogRef<any>): void {
    if (this.formTipo.invalid || this.guardando) return;

    const v = this.formTipo.value;
    const cambios = { nombre: v.nombre.trim(), consecutivoActual: Number(v.consecutivoActual) };
    const seleccionado = this.tipoSeleccionado;

    const peticion$: Observable<TipoComprobante> = seleccionado
      ? this.tiposService.editar(seleccionado.idTipoComprobante, cambios)
      : this.tiposService.crear({ codigo: v.codigo.trim(), ...cambios });

    this.guardando = true;
    this.errorGuardar = '';

    peticion$.subscribe({
      next: guardado => {
        this.tipos = (seleccionado
          ? this.tipos.map(t => t.idTipoComprobante === guardado.idTipoComprobante ? guardado : t)
          : [...this.tipos, guardado]
        ).sort((a, b) => a.codigo.localeCompare(b.codigo));
        this.guardando = false;
        dialogRef.close();
        this.toastr.success(`${guardado.codigo} ${guardado.nombre}`, seleccionado ? 'Tipo actualizado' : 'Tipo creado');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorGuardar = mensajeDeError(err);
      },
    });
  }
}
