import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../@core/services/auth.service';
import { CentrosCostoService } from '../../centros-costo/centros-costo.service';
import { CuentaContable } from '../../plan-cuentas/models/cuenta.model';
import { PlanCuentasService } from '../../plan-cuentas/plan-cuentas.service';
import { Tercero } from '../../terceros/models/tercero.model';
import { TercerosService } from '../../terceros/terceros.service';
import { TiposComprobanteService } from '../../tipos-comprobante/tipos-comprobante.service';
import { AsientosService } from '../asientos.service';
import { Asiento } from '../models/asiento.model';
import { AsientoEditorComponent } from './asiento-editor.component';

function cuenta(idCuenta: number, codigo: string, nombreCuenta: string, extra: Partial<CuentaContable> = {}): CuentaContable {
  return {
    idCuenta, codigo, nombreCuenta, idCuentaPadre: null, nivel: 4, tipoCuenta: 'ACTIVO', naturaleza: 'DEBITO',
    esMovimiento: true, pideTercero: false, pideCentroCosto: false, activo: true, ...extra,
  };
}

const CAJA = cuenta(4, '110505', 'Caja General');
const VENTAS = cuenta(17, '413505', 'Ventas', { tipoCuenta: 'INGRESO', naturaleza: 'CREDITO', pideTercero: true });
const SERVICIOS = cuenta(20, '513505', 'Servicios', { tipoCuenta: 'GASTO', pideCentroCosto: true });
const MAYOR = cuenta(3, '1105', 'CAJA', { esMovimiento: false, nivel: 3 });
const CLIENTE: Tercero = {
  idTercero: 1, tipoDocumento: 'NIT', numeroDocumento: '900123456', digitoVerificacion: 8,
  nombreRazonSocial: 'Cliente Demo', tiposTercero: ['CLIENTE'], direccion: null, telefono: null, email: null, activo: true,
};

const PUBLICADO: Asiento = {
  idAsiento: 9, idTipoComprobante: 1, comprobante: 'ING-0005', numeroComprobante: 5, fechaAsiento: '2026-10-15',
  idPeriodo: 3, conceptoGeneral: 'Venta', estado: 'PUBLICADO', totalDebe: 100, totalHaber: 100, lineas: [],
};

describe('AsientoEditorComponent', () => {
  let fixture: ComponentFixture<AsientoEditorComponent>;
  let component: AsientoEditorComponent;
  let asientos: jasmine.SpyObj<AsientosService>;
  let router: jasmine.SpyObj<Router>;

  async function crear(idRuta: string | null, rol = 'AUXILIAR') {
    await TestBed.configureTestingModule({
      declarations: [AsientoEditorComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AsientosService, useValue: asientos },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(idRuta ? { id: idRuta } : {}) } } },
        { provide: AuthService, useValue: { getRol: () => rol } },
        { provide: NbToastrService, useValue: jasmine.createSpyObj('NbToastrService', ['success']) },
        { provide: TiposComprobanteService, useValue: { listar: () => of([{ idTipoComprobante: 1, codigo: 'ING', nombre: 'Ingreso', consecutivoActual: 5 }]) } },
        { provide: PlanCuentasService, useValue: { listar: () => of([CAJA, VENTAS, SERVICIOS, MAYOR]) } },
        { provide: TercerosService, useValue: { listar: () => of([CLIENTE]) } },
        { provide: CentrosCostoService, useValue: { listar: () => of([{ idCentroCosto: 1, codigo: 'CC-100', nombre: 'Adm', activo: true }]) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(AsientoEditorComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AsientoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  /** Simula escribir en el buscador de cuenta y salir del campo. */
  function elegirCuenta(i: number, texto: string) {
    component.lineasGrupos[i].patchValue({ cuenta: texto });
    component.alCambiarCuenta(i);
  }

  beforeEach(() => {
    asientos = jasmine.createSpyObj('AsientosService', ['obtener', 'crear', 'editar', 'anular']);
    router = jasmine.createSpyObj('Router', ['navigate']);
  });

  it('un asiento nuevo arranca con dos líneas, el primer tipo y solo cuentas auxiliares', async () => {
    await crear(null);

    expect(component.lineas.length).toBe(2);
    expect(component.form.value.idTipoComprobante).toBe(1);
    expect(component.cuentas.map(c => c.codigo)).not.toContain('1105');
  });

  it('el buscador acepta el código y lo convierte en la cuenta', async () => {
    await crear(null);

    elegirCuenta(0, '110505');

    expect(component.lineasGrupos[0].value.idCuenta).toBe(4);
    expect(component.lineasGrupos[0].value.cuenta).toBe('110505 - Caja General');
  });

  it('calcula totales y cuadre redondeando a centavos', async () => {
    await crear(null);
    component.lineasGrupos[0].patchValue({ debe: 0.1 });
    component.agregarLinea();
    component.lineasGrupos[2].patchValue({ debe: 0.2 });
    component.lineasGrupos[1].patchValue({ haber: 0.3 });

    expect(component.totalDebe).toBe(0.3);
    expect(component.cuadra).toBe(true);
  });

  it('escribir en crédito limpia el débito de la misma línea', async () => {
    await crear(null);
    const linea = component.lineasGrupos[0];
    linea.patchValue({ debe: 50 });

    linea.patchValue({ haber: 50 });
    component.alEscribirValor(0, 'haber');

    expect(linea.value.debe).toBeNull();
  });

  it('marca la línea si la cuenta exige tercero o centro de costo', async () => {
    await crear(null);
    elegirCuenta(0, '413505');
    elegirCuenta(1, '513505');
    component.lineasGrupos[0].patchValue({ haber: 10 });
    component.lineasGrupos[1].patchValue({ debe: 10 });

    expect(component.lineasGrupos[0].hasError('tercero')).toBe(true);
    expect(component.lineasGrupos[1].hasError('centro')).toBe(true);

    component.lineasGrupos[0].patchValue({ tercero: '900123456-8 - Cliente Demo' });
    component.alCambiarTercero(0);
    expect(component.lineasGrupos[0].hasError('tercero')).toBe(false);
  });

  it('no publica un asiento descuadrado', async () => {
    await crear(null);
    component.form.patchValue({ conceptoGeneral: 'Venta' });
    elegirCuenta(0, '110505');
    elegirCuenta(1, '110505');
    component.lineasGrupos[0].patchValue({ debe: 100 });
    component.lineasGrupos[1].patchValue({ haber: 90 });

    component.guardar(true);

    expect(asientos.crear).not.toHaveBeenCalled();
    expect(component.errorGuardar).toContain('deben ser iguales');
  });

  it('guarda un borrador y pasa a la URL del asiento', async () => {
    await crear(null);
    asientos.crear.and.returnValue(of({ ...PUBLICADO, estado: 'BORRADOR' }));
    component.form.patchValue({ conceptoGeneral: 'Venta', fechaAsiento: '2026-10-15' });
    elegirCuenta(0, '110505');
    elegirCuenta(1, '110505');
    component.lineasGrupos[0].patchValue({ debe: 100 });
    component.lineasGrupos[1].patchValue({ haber: 40 });

    component.guardar(false);

    const enviado = asientos.crear.calls.mostRecent().args[0];
    expect(enviado.publicar).toBe(false);
    expect(enviado.lineas).toEqual([
      { idCuenta: 4, idTercero: null, idCentroCosto: null, concepto: null, debe: 100, haber: 0 },
      { idCuenta: 4, idTercero: null, idCentroCosto: null, concepto: null, debe: 0, haber: 40 },
    ]);
    expect(router.navigate).toHaveBeenCalledWith(['/pages/asientos', 9], { replaceUrl: true });
  });

  it('muestra el mensaje de la API si no puede guardar', async () => {
    await crear(null);
    asientos.crear.and.returnValue(throwError(new HttpErrorResponse({
      status: 400, error: { message: 'El período agosto 2026 está cerrado.' },
    })));
    component.form.patchValue({ conceptoGeneral: 'Venta' });
    elegirCuenta(0, '110505');
    elegirCuenta(1, '110505');
    component.lineasGrupos[0].patchValue({ debe: 1 });
    component.lineasGrupos[1].patchValue({ haber: 1 });

    component.guardar(true);

    expect(component.errorGuardar).toBe('El período agosto 2026 está cerrado.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('un asiento publicado se muestra solo para consulta y no se guarda', async () => {
    asientos.obtener.and.returnValue(of(PUBLICADO));
    await crear('9');

    component.guardar(false);

    expect(component.soloLectura).toBe(true);
    expect(asientos.editar).not.toHaveBeenCalled();
  });

  it('el auxiliar no puede anular; el contador sí, tras confirmar', async () => {
    asientos.obtener.and.returnValue(of(PUBLICADO));
    await crear('9', 'AUXILIAR');
    expect(component.puedeAnular).toBe(false);

    TestBed.resetTestingModule();
    asientos.anular.and.returnValue(of({ ...PUBLICADO, estado: 'ANULADO' }));
    await crear('9', 'CONTADOR');
    spyOn(component, 'confirmar').and.returnValue(true);

    component.anular();

    expect(asientos.anular).toHaveBeenCalledWith(9);
    expect(component.asiento!.estado).toBe('ANULADO');
  });
});
