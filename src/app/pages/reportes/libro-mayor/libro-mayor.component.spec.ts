import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CuentaContable } from '../../plan-cuentas/models/cuenta.model';
import { PlanCuentasService } from '../../plan-cuentas/plan-cuentas.service';
import { ReportesService } from '../reportes.service';
import { LibroMayorComponent } from './libro-mayor.component';

const CAJA: CuentaContable = {
  idCuenta: 4, codigo: '110505', nombreCuenta: 'Caja General', idCuentaPadre: 3, nivel: 4,
  tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO', esMovimiento: true, pideTercero: false, pideCentroCosto: false, activo: true,
};

describe('LibroMayorComponent', () => {
  let fixture: ComponentFixture<LibroMayorComponent>;
  let component: LibroMayorComponent;
  let reportes: jasmine.SpyObj<ReportesService>;

  beforeEach(async () => {
    reportes = jasmine.createSpyObj('ReportesService', ['libroMayor']);
    reportes.libroMayor.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      declarations: [LibroMayorComponent],
      providers: [
        { provide: ReportesService, useValue: reportes },
        { provide: PlanCuentasService, useValue: { listar: () => of([CAJA]) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideTemplate(LibroMayorComponent, '').compileComponents();

    fixture = TestBed.createComponent(LibroMayorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('acepta el código de la cuenta y consulta con su id', () => {
    component.textoCuenta = '110505';

    component.consultar();

    expect(reportes.libroMayor).toHaveBeenCalledWith(4, component.desde, component.hasta);
    expect(component.textoCuenta).toBe('110505 - Caja General');
  });

  it('no consulta si la cuenta no existe', () => {
    component.textoCuenta = '999999';

    component.consultar();

    expect(reportes.libroMayor).not.toHaveBeenCalled();
    expect(component.error).toBe('Elija una cuenta de la lista.');
  });
});
