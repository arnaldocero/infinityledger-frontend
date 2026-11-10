import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { of, throwError } from 'rxjs';

import { TiposComprobanteComponent } from './tipos-comprobante.component';
import { TipoComprobante, TiposComprobanteService } from './tipos-comprobante.service';

const INGRESO: TipoComprobante = { idTipoComprobante: 1, codigo: 'ING', nombre: 'Ingreso', consecutivoActual: 5 };

describe('TiposComprobanteComponent', () => {
  let fixture: ComponentFixture<TiposComprobanteComponent>;
  let component: TiposComprobanteComponent;
  let servicio: jasmine.SpyObj<TiposComprobanteService>;
  let dialogRef: jasmine.SpyObj<NbDialogRef<any>>;

  beforeEach(async () => {
    servicio = jasmine.createSpyObj('TiposComprobanteService', ['listar', 'crear', 'editar']);
    servicio.listar.and.returnValue(of([INGRESO]));
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [TiposComprobanteComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TiposComprobanteService, useValue: servicio },
        { provide: NbToastrService, useValue: jasmine.createSpyObj('NbToastrService', ['success']) },
        { provide: NbDialogService, useValue: jasmine.createSpyObj('NbDialogService', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(TiposComprobanteComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TiposComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('valida que el código tenga solo letras', () => {
    component.abrirModal();
    component.formTipo.patchValue({ codigo: 'R1', nombre: 'Recibo' });

    expect(component.formTipo.get('codigo')!.invalid).toBe(true);
  });

  it('crea un tipo y lo agrega en orden de código', () => {
    servicio.crear.and.returnValue(of({ idTipoComprobante: 6, codigo: 'EGR', nombre: 'Egreso', consecutivoActual: 1 }));
    component.abrirModal();

    component.formTipo.patchValue({ codigo: 'egr', nombre: 'Egreso' });
    component.guardar(dialogRef);

    expect(servicio.crear).toHaveBeenCalledWith({ codigo: 'egr', nombre: 'Egreso', consecutivoActual: 1 });
    expect(component.tipos.map(t => t.codigo)).toEqual(['EGR', 'ING']);
  });

  it('al editar no envía el código', () => {
    servicio.editar.and.returnValue(of({ ...INGRESO, consecutivoActual: 10 }));
    component.abrirModal(INGRESO);

    component.formTipo.patchValue({ consecutivoActual: '10' });
    component.guardar(dialogRef);

    expect(servicio.editar).toHaveBeenCalledWith(1, { nombre: 'Ingreso', consecutivoActual: 10 });
  });

  it('muestra el error de la API si el consecutivo ya está usado', () => {
    servicio.editar.and.returnValue(throwError(new HttpErrorResponse({
      status: 400, error: { message: 'El consecutivo debe ser mayor que 4: ese número ya está usado por un comprobante ING.' },
    })));
    component.abrirModal(INGRESO);

    component.formTipo.patchValue({ consecutivoActual: 3 });
    component.guardar(dialogRef);

    expect(component.errorGuardar).toContain('ya está usado');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
