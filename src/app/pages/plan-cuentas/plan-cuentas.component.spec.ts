import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { of, throwError } from 'rxjs';

import { PlanCuentasComponent } from './plan-cuentas.component';
import { PlanCuentasService } from './plan-cuentas.service';
import { CuentaContable } from './models/cuenta.model';

function cuenta(idCuenta: number, codigo: string, nombreCuenta: string, nivel: number, esMovimiento = false): CuentaContable {
  return {
    idCuenta, codigo, nombreCuenta, nivel, idCuentaPadre: null, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO',
    esMovimiento, pideTercero: false, pideCentroCosto: false, activo: true,
  };
}

const CUENTAS: CuentaContable[] = [
  cuenta(1, '1', 'ACTIVO', 1),
  cuenta(2, '11', 'DISPONIBLE', 2),
  cuenta(3, '1105', 'CAJA', 3),
  cuenta(4, '110505', 'Caja General', 4, true),
];

describe('PlanCuentasComponent', () => {
  let fixture: ComponentFixture<PlanCuentasComponent>;
  let component: PlanCuentasComponent;
  let servicio: jasmine.SpyObj<PlanCuentasService>;
  let toastr: jasmine.SpyObj<NbToastrService>;
  let dialogRef: jasmine.SpyObj<NbDialogRef<any>>;

  function crear(listar = of(CUENTAS)) {
    servicio.listar.and.returnValue(listar);
    fixture = TestBed.createComponent(PlanCuentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    servicio = jasmine.createSpyObj('PlanCuentasService', ['listar', 'crear', 'editar']);
    toastr = jasmine.createSpyObj('NbToastrService', ['success']);
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [PlanCuentasComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: PlanCuentasService, useValue: servicio },
        { provide: NbToastrService, useValue: toastr },
        { provide: NbDialogService, useValue: jasmine.createSpyObj('NbDialogService', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      // La plantilla usa componentes de Nebular; aquí se prueba solo la lógica.
      .overrideTemplate(PlanCuentasComponent, '')
      .compileComponents();
  });

  it('carga las cuentas desde la API', () => {
    crear();

    expect(component.cuentasFiltradas.map(c => c.codigo)).toEqual(['1', '11', '1105', '110505']);
    expect(component.cargando).toBe(false);
  });

  it('muestra el error si la API no responde', () => {
    crear(throwError(new HttpErrorResponse({ status: 0 })));

    expect(component.errorCarga).toBe('No se pudo conectar con el servidor.');
    expect(component.cuentas).toEqual([]);
  });

  it('crea una cuenta, la agrega a la tabla y cierra el diálogo', () => {
    crear();
    const nueva = cuenta(5, '110510', 'Cajas Menores', 4, true);
    servicio.crear.and.returnValue(of(nueva));

    component.abrirModalCuenta();
    component.formCuenta.patchValue({ codigo: '110510', nombreCuenta: 'Cajas Menores' });
    component.guardarCuenta(dialogRef);

    expect(servicio.crear).toHaveBeenCalledWith(jasmine.objectContaining({ codigo: '110510', nombreCuenta: 'Cajas Menores' }));
    expect(component.cuentasFiltradas.map(c => c.codigo)).toContain('110510');
    expect(dialogRef.close).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalled();
  });

  it('una cuenta nueva hereda el tipo y la naturaleza de su padre', () => {
    const pasivo: CuentaContable = { ...cuenta(9, '2', 'PASIVO', 1), tipoCuenta: 'PASIVO', naturaleza: 'CREDITO' };
    crear(of([pasivo]));

    component.abrirModalCuenta();
    component.formCuenta.get('codigo')!.setValue('22');

    expect(component.formCuenta.value.tipoCuenta).toBe('PASIVO');
    expect(component.formCuenta.value.naturaleza).toBe('CREDITO');
  });

  it('edita una cuenta sin enviar el código y reemplaza la fila', () => {
    crear();
    const editada = { ...CUENTAS[3], nombreCuenta: 'Caja Principal' };
    servicio.editar.and.returnValue(of(editada));

    component.abrirModalCuenta(CUENTAS[3]);
    component.formCuenta.patchValue({ nombreCuenta: 'Caja Principal' });
    component.guardarCuenta(dialogRef);

    const [id, cambios] = servicio.editar.calls.mostRecent().args;
    expect(id).toBe(4);
    expect('codigo' in cambios).toBe(false);
    expect(component.cuentas.find(c => c.idCuenta === 4)!.nombreCuenta).toBe('Caja Principal');
  });

  it('muestra el mensaje de la API y deja el diálogo abierto si no se puede guardar', () => {
    crear();
    servicio.crear.and.returnValue(throwError(new HttpErrorResponse({
      status: 400, error: { message: 'La cuenta 1105 es auxiliar (recibe movimientos) y no puede tener subcuentas.' },
    })));

    component.abrirModalCuenta();
    component.formCuenta.patchValue({ codigo: '110510', nombreCuenta: 'Cajas Menores' });
    component.guardarCuenta(dialogRef);

    expect(component.errorGuardar).toContain('es auxiliar');
    expect(component.guardando).toBe(false);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
