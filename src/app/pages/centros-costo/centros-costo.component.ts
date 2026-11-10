import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { Observable } from 'rxjs';

import { mensajeDeError } from '../../@core/utils/mensaje-error';
import { CentroCosto, CentrosCostoService, GuardarCentroCosto } from './centros-costo.service';

@Component({
  selector: 'ngx-centros-costo',
  templateUrl: './centros-costo.component.html',
  styleUrls: ['./centros-costo.component.scss'],
})
export class CentrosCostoComponent implements OnInit {

  @ViewChild('dialogCentro') dialogCentro!: TemplateRef<any>;

  centros: CentroCosto[] = [];
  cargando = false;
  errorCarga = '';

  formCentro!: FormGroup;
  centroSeleccionado: CentroCosto | null = null;
  guardando = false;
  errorGuardar = '';

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private toastr: NbToastrService,
    private centrosService: CentrosCostoService,
  ) {}

  ngOnInit(): void {
    this.formCentro = this.fb.group({
      // Mismo formato que exige la API; la API lo guarda en mayúsculas.
      codigo: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9-]+$/)]],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      activo: [true],
    });
    this.cargarCentros();
  }

  cargarCentros(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.centrosService.listar().subscribe({
      next: centros => {
        this.centros = centros;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga = mensajeDeError(err);
        this.cargando = false;
      },
    });
  }

  abrirModal(centro?: CentroCosto): void {
    this.centroSeleccionado = centro ?? null;
    this.errorGuardar = '';
    this.guardando = false;
    this.formCentro.reset({
      codigo: centro?.codigo ?? '',
      nombre: centro?.nombre ?? '',
      activo: centro?.activo ?? true,
    });
    this.dialogService.open(this.dialogCentro);
  }

  guardar(dialogRef: NbDialogRef<any>): void {
    if (this.formCentro.invalid || this.guardando) return;

    const v = this.formCentro.value;
    const datos: GuardarCentroCosto = { codigo: v.codigo.trim(), nombre: v.nombre.trim(), activo: v.activo };
    const seleccionado = this.centroSeleccionado;

    const peticion$: Observable<CentroCosto> = seleccionado
      ? this.centrosService.editar(seleccionado.idCentroCosto, datos)
      : this.centrosService.crear(datos);

    this.guardando = true;
    this.errorGuardar = '';

    peticion$.subscribe({
      next: guardado => {
        this.centros = (seleccionado
          ? this.centros.map(c => c.idCentroCosto === guardado.idCentroCosto ? guardado : c)
          : [...this.centros, guardado]
        ).sort((a, b) => a.codigo.localeCompare(b.codigo));
        this.guardando = false;
        dialogRef.close();
        this.toastr.success(`${guardado.codigo} ${guardado.nombre}`, seleccionado ? 'Centro de costo actualizado' : 'Centro de costo creado');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorGuardar = mensajeDeError(err);
      },
    });
  }
}
