import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { of, throwError } from 'rxjs';

import { TercerosComponent } from './terceros.component';
import { TercerosService } from './terceros.service';
import { Tercero } from './models/tercero.model';

const CLIENTE: Tercero = {
  idTercero: 1, tipoDocumento: 'NIT', numeroDocumento: '900123456', digitoVerificacion: 8,
  nombreRazonSocial: 'Cliente Demo S.A.S.', tiposTercero: ['CLIENTE'], direccion: null, telefono: null, email: null, activo: true,
};
const PROVEEDOR: Tercero = {
  idTercero: 2, tipoDocumento: 'CC', numeroDocumento: '1234567', digitoVerificacion: null,
  nombreRazonSocial: 'Proveedor Persona', tiposTercero: ['PROVEEDOR'], direccion: null, telefono: null, email: null, activo: true,
};

describe('TercerosComponent', () => {
  let fixture: ComponentFixture<TercerosComponent>;
  let component: TercerosComponent;
  let servicio: jasmine.SpyObj<TercerosService>;
  let dialogRef: jasmine.SpyObj<NbDialogRef<any>>;

  function crear(listar = of([PROVEEDOR, CLIENTE])) {
    servicio.listar.and.returnValue(listar);
    fixture = TestBed.createComponent(TercerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    servicio = jasmine.createSpyObj('TercerosService', ['listar', 'crear', 'editar']);
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [TercerosComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TercerosService, useValue: servicio },
        { provide: NbToastrService, useValue: jasmine.createSpyObj('NbToastrService', ['success']) },
        { provide: NbDialogService, useValue: jasmine.createSpyObj('NbDialogService', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      // La plantilla usa componentes de Nebular; aquí se prueba solo la lógica.
      .overrideTemplate(TercerosComponent, '')
      .compileComponents();
  });

  it('carga los terceros ordenados por nombre', () => {
    crear();

    expect(component.tercerosFiltrados.map(t => t.idTercero)).toEqual([1, 2]);
  });

  it('filtra por tipo y por texto', () => {
    crear();

    component.filtroTipo = 'PROVEEDOR';
    component.filtrar();
    expect(component.tercerosFiltrados.map(t => t.idTercero)).toEqual([2]);

    component.filtroTipo = '';
    component.textoBusqueda = '90012';
    component.filtrar();
    expect(component.tercerosFiltrados.map(t => t.idTercero)).toEqual([1]);
  });

  it('muestra el dígito de verificación mientras se escribe un NIT', () => {
    crear();
    component.abrirModal();

    component.formTercero.patchValue({ tipoDocumento: 'NIT', numeroDocumento: '800197268' });
    expect(component.digitoFormulario).toBe(4);

    component.formTercero.patchValue({ tipoDocumento: 'CC' });
    expect(component.digitoFormulario).toBeNull();
  });

  it('valida el formato del número según el tipo de documento', () => {
    crear();
    component.abrirModal();
    const numero = component.formTercero.get('numeroDocumento')!;

    component.formTercero.patchValue({ tipoDocumento: 'CC', numeroDocumento: 'AB12345' });
    expect(numero.hasError('numerico')).toBe(true);

    component.formTercero.patchValue({ tipoDocumento: 'PASAPORTE' });
    expect(numero.valid).toBe(true);
  });

  it('exige al menos un tipo de tercero', () => {
    crear();
    component.abrirModal();

    component.formTercero.get('tipos')!.patchValue({ CLIENTE: false });

    expect(component.formTercero.get('tipos')!.hasError('sinTipo')).toBe(true);
  });

  it('envía los tipos marcados y los campos vacíos como null', () => {
    crear();
    servicio.crear.and.returnValue(of({ ...PROVEEDOR, idTercero: 3 }));
    component.abrirModal();

    component.formTercero.patchValue({
      tipoDocumento: 'CC', numeroDocumento: ' 1020304050 ', nombreRazonSocial: 'Nueva Persona',
      tipos: { CLIENTE: true, PROVEEDOR: true }, telefono: '  ',
    });
    component.guardar(dialogRef);

    expect(servicio.crear).toHaveBeenCalledWith(jasmine.objectContaining({
      numeroDocumento: '1020304050', tiposTercero: ['CLIENTE', 'PROVEEDOR'], telefono: null, email: null,
    }));
    expect(dialogRef.close).toHaveBeenCalled();
    expect(component.terceros.length).toBe(3);
  });

  it('muestra el error de la API y deja el diálogo abierto', () => {
    crear();
    servicio.crear.and.returnValue(throwError(new HttpErrorResponse({
      status: 409, error: { message: 'Ya existe un tercero con el documento 900123456.' },
    })));
    component.abrirModal();

    component.formTercero.patchValue({ numeroDocumento: '900123456', nombreRazonSocial: 'Repetido' });
    component.guardar(dialogRef);

    expect(component.errorGuardar).toContain('Ya existe un tercero');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('muestra el error si la API no responde al cargar', () => {
    crear(throwError(new HttpErrorResponse({ status: 0 })));

    expect(component.errorCarga).toBe('No se pudo conectar con el servidor.');
  });
});
