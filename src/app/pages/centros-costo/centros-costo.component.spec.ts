import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { of, throwError } from 'rxjs';

import { CentrosCostoComponent } from './centros-costo.component';
import { CentroCosto, CentrosCostoService } from './centros-costo.service';

const ADMINISTRACION: CentroCosto = { idCentroCosto: 1, codigo: 'CC-100', nombre: 'Administración', activo: true };
const DESARROLLO: CentroCosto = { idCentroCosto: 2, codigo: 'CC-200', nombre: 'Desarrollo', activo: true };

describe('CentrosCostoComponent', () => {
  let fixture: ComponentFixture<CentrosCostoComponent>;
  let component: CentrosCostoComponent;
  let servicio: jasmine.SpyObj<CentrosCostoService>;
  let dialogRef: jasmine.SpyObj<NbDialogRef<any>>;

  beforeEach(async () => {
    servicio = jasmine.createSpyObj('CentrosCostoService', ['listar', 'crear', 'editar']);
    servicio.listar.and.returnValue(of([ADMINISTRACION, DESARROLLO]));
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [CentrosCostoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: CentrosCostoService, useValue: servicio },
        { provide: NbToastrService, useValue: jasmine.createSpyObj('NbToastrService', ['success']) },
        { provide: NbDialogService, useValue: jasmine.createSpyObj('NbDialogService', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CentrosCostoComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CentrosCostoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga los centros de costo', () => {
    expect(component.centros.map(c => c.codigo)).toEqual(['CC-100', 'CC-200']);
  });

  it('rechaza códigos con espacios', () => {
    component.abrirModal();
    component.formCentro.patchValue({ codigo: 'CC 300', nombre: 'Ventas' });

    expect(component.formCentro.get('codigo')!.invalid).toBe(true);
  });

  it('crea un centro y lo ubica en orden de código', () => {
    servicio.crear.and.returnValue(of({ idCentroCosto: 3, codigo: 'CC-150', nombre: 'Ventas', activo: true }));
    component.abrirModal();

    component.formCentro.patchValue({ codigo: 'cc-150', nombre: 'Ventas' });
    component.guardar(dialogRef);

    expect(servicio.crear).toHaveBeenCalledWith({ codigo: 'cc-150', nombre: 'Ventas', activo: true });
    expect(component.centros.map(c => c.codigo)).toEqual(['CC-100', 'CC-150', 'CC-200']);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('edita un centro existente', () => {
    servicio.editar.and.returnValue(of({ ...DESARROLLO, activo: false }));
    component.abrirModal(DESARROLLO);

    component.formCentro.patchValue({ activo: false });
    component.guardar(dialogRef);

    expect(servicio.editar).toHaveBeenCalledWith(2, { codigo: 'CC-200', nombre: 'Desarrollo', activo: false });
    expect(component.centros.find(c => c.idCentroCosto === 2)!.activo).toBe(false);
  });

  it('muestra el mensaje de permisos si la API responde 403', () => {
    servicio.crear.and.returnValue(throwError(new HttpErrorResponse({ status: 403 })));
    component.abrirModal();

    component.formCentro.patchValue({ codigo: 'CC-300', nombre: 'Ventas' });
    component.guardar(dialogRef);

    expect(component.errorGuardar).toBe('No tiene permisos para realizar esta acción.');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
