import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../@core/services/auth.service';
import { PeriodosComponent } from './periodos.component';
import { Periodo, PeriodosService, nombrePeriodo } from './periodos.service';

const SEPTIEMBRE: Periodo = { idPeriodo: 2, anio: 2026, mes: 9, fechaInicio: '2026-09-01', fechaFin: '2026-09-30', estado: 'ABIERTO' };
const AGOSTO: Periodo = { idPeriodo: 1, anio: 2026, mes: 8, fechaInicio: '2026-08-01', fechaFin: '2026-08-31', estado: 'CERRADO' };

describe('PeriodosComponent', () => {
  let fixture: ComponentFixture<PeriodosComponent>;
  let component: PeriodosComponent;
  let servicio: jasmine.SpyObj<PeriodosService>;
  let dialogRef: jasmine.SpyObj<NbDialogRef<any>>;

  function crear(rol: string) {
    TestBed.overrideProvider(AuthService, { useValue: { getRol: () => rol } });
    fixture = TestBed.createComponent(PeriodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    servicio = jasmine.createSpyObj('PeriodosService', ['listar', 'crear', 'generarAnio', 'cerrar', 'reabrir']);
    servicio.listar.and.returnValue(of([SEPTIEMBRE, AGOSTO]));
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [PeriodosComponent],
      providers: [
        { provide: PeriodosService, useValue: servicio },
        { provide: AuthService, useValue: { getRol: () => 'ADMIN' } },
        { provide: NbToastrService, useValue: jasmine.createSpyObj('NbToastrService', ['success']) },
        { provide: NbDialogService, useValue: jasmine.createSpyObj('NbDialogService', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(PeriodosComponent, '')
      .compileComponents();
  });

  it('nombra el período con el mes en español', () => {
    expect(nombrePeriodo(SEPTIEMBRE)).toBe('Septiembre 2026');
  });

  it('solo el ADMIN puede reabrir', () => {
    crear('CONTADOR');
    expect(component.puedeReabrir).toBe(false);
  });

  it('cierra un período confirmado y actualiza la fila', () => {
    crear('ADMIN');
    servicio.cerrar.and.returnValue(of({ ...SEPTIEMBRE, estado: 'CERRADO' }));

    component.confirmar('cerrar', SEPTIEMBRE);
    component.ejecutarAccion(dialogRef);

    expect(servicio.cerrar).toHaveBeenCalledWith(2);
    expect(component.periodos.find(p => p.idPeriodo === 2)!.estado).toBe('CERRADO');
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('muestra en el diálogo por qué la API no permite cerrar', () => {
    crear('ADMIN');
    servicio.cerrar.and.returnValue(throwError(new HttpErrorResponse({
      status: 400, error: { message: 'Primero cierre el período agosto 2026.' },
    })));

    component.confirmar('cerrar', SEPTIEMBRE);
    component.ejecutarAccion(dialogRef);

    expect(component.errorAccion).toContain('Primero cierre');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('genera el año y recarga la lista', () => {
    crear('ADMIN');
    servicio.generarAnio.and.returnValue(of([]));
    component.anioNuevo = 2027;

    component.generarAnio();

    expect(servicio.generarAnio).toHaveBeenCalledWith(2027);
    expect(servicio.listar).toHaveBeenCalledTimes(2);
  });

  it('no envía un año fuera de rango', () => {
    crear('ADMIN');
    component.anioNuevo = 1999;

    component.crearMes();

    expect(servicio.crear).not.toHaveBeenCalled();
  });
});
