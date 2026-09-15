import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { CuentaContable } from './models/cuenta.model';

@Component({
  selector: 'ngx-plan-cuentas',
  templateUrl: './plan-cuentas.component.html',
  styleUrls: ['./plan-cuentas.component.scss'],
})
export class PlanCuentasComponent implements OnInit {

  @ViewChild('dialogCuenta') dialogCuenta!: TemplateRef<any>;

  textoBusqueda: string = '';
  cuentas: CuentaContable[] = [];
  cuentasFiltradas: CuentaContable[] = [];

  // Variables para la Modal
  formCuenta!: FormGroup;
  cuentaSeleccionada: CuentaContable | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCuentasEjemplo();
  }

  inicializarFormulario(): void {
    this.formCuenta = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(1)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['Activo', [Validators.required]],
      nivel: [4, [Validators.required]],
      permiteMovimiento: [true],
      estado: [true],
    });
  }

  cargarCuentasEjemplo(): void {
    this.cuentas = [
      { id: 1, codigo: '1', nombre: 'ACTIVO', tipo: 'Activo', nivel: 1, permiteMovimiento: false, estado: true },
      { id: 2, codigo: '11', nombre: 'DISPONIBLE', tipo: 'Activo', nivel: 2, permiteMovimiento: false, estado: true },
      { id: 3, codigo: '1105', nombre: 'CAJA', tipo: 'Activo', nivel: 3, permiteMovimiento: false, estado: true },
      { id: 4, codigo: '110505', nombre: 'Caja General', tipo: 'Activo', nivel: 4, permiteMovimiento: true, estado: true },
      { id: 5, codigo: '110510', nombre: 'Cajas Menores', tipo: 'Activo', nivel: 4, permiteMovimiento: true, estado: true },
      { id: 6, codigo: '1110', nombre: 'BANCOS', tipo: 'Activo', nivel: 3, permiteMovimiento: false, estado: true },
      { id: 7, codigo: '111005', nombre: 'Bancos Nacionales', tipo: 'Activo', nivel: 4, permiteMovimiento: true, estado: true },
      { id: 8, codigo: '2', nombre: 'PASIVO', tipo: 'Pasivo', nivel: 1, permiteMovimiento: false, estado: true },
      { id: 9, codigo: '3', nombre: 'PATRIMONIO', tipo: 'Patrimonio', nivel: 1, permiteMovimiento: false, estado: true },
      { id: 10, codigo: '4', nombre: 'INGRESOS', tipo: 'Ingresos', nivel: 1, permiteMovimiento: false, estado: true },
      { id: 11, codigo: '5', nombre: 'GASTOS', tipo: 'Gastos', nivel: 1, permiteMovimiento: false, estado: true },
    ];

    this.cuentasFiltradas = [...this.cuentas];
  }

  filtrarCuentas(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.cuentasFiltradas = [...this.cuentas];
      return;
    }

    this.cuentasFiltradas = this.cuentas.filter(c =>
      c.codigo.toLowerCase().includes(busqueda) ||
      c.nombre.toLowerCase().includes(busqueda) ||
      c.tipo.toLowerCase().includes(busqueda)
    );
  }

  getIndentacion(nivel: number): number {
    return (nivel - 1) * 20;
  }

  // Abrir la ventana modal (Crear / Editar)
  abrirModalCuenta(cuenta?: CuentaContable): void {
    if (cuenta) {
      this.cuentaSeleccionada = cuenta;
      this.formCuenta.patchValue({
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        nivel: cuenta.nivel,
        permiteMovimiento: cuenta.permiteMovimiento,
        estado: cuenta.estado,
      });
    } else {
      this.cuentaSeleccionada = null;
      this.formCuenta.reset({
        codigo: '',
        nombre: '',
        tipo: 'Activo',
        nivel: 4,
        permiteMovimiento: true,
        estado: true,
      });
    }

    this.dialogService.open(this.dialogCuenta);
  }

  // Guardar (Agregar o Modificar en memoria)
  guardarCuenta(dialogRef: NbDialogRef<any>): void {
    if (this.formCuenta.invalid) return;

    const datosForm = this.formCuenta.value;

    if (this.cuentaSeleccionada) {
      // Modo Edición
      const index = this.cuentas.findIndex(c => c.id === this.cuentaSeleccionada?.id);
      if (index !== -1) {
        this.cuentas[index] = { ...this.cuentaSeleccionada, ...datosForm };
      }
    } else {
      // Modo Creación
      const nuevaCuenta: CuentaContable = {
        id: this.cuentas.length + 1,
        ...datosForm,
      };
      this.cuentas.push(nuevaCuenta);
    }

    this.filtrarCuentas();
    dialogRef.close();
  }
}