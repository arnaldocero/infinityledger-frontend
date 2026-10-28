import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { PlanCuentasService } from './plan-cuentas.service';

describe('PlanCuentasService', () => {
  const url = `${environment.apiUrl}/plan-cuentas`;
  let service: PlanCuentasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PlanCuentasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar hace GET a /plan-cuentas', () => {
    service.listar().subscribe();

    expect(http.expectOne(url).request.method).toBe('GET');
  });

  it('crear hace POST con el código y los datos', () => {
    const nueva = {
      codigo: '110510', nombreCuenta: 'Cajas Menores', tipoCuenta: 'ACTIVO' as const, naturaleza: 'DEBITO' as const,
      esMovimiento: true, pideTercero: false, pideCentroCosto: false, activo: true,
    };

    service.crear(nueva).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nueva);
  });

  it('editar hace PUT a /plan-cuentas/{id} sin el código', () => {
    const cambios = {
      nombreCuenta: 'Caja Principal', tipoCuenta: 'ACTIVO' as const, naturaleza: 'DEBITO' as const,
      esMovimiento: true, pideTercero: true, pideCentroCosto: false, activo: true,
    };

    service.editar(4, cambios).subscribe();

    const req = http.expectOne(`${url}/4`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cambios);
  });
});
