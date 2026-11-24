import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { ReportesService } from './reportes.service';

describe('ReportesService', () => {
  const url = `${environment.apiUrl}/reportes`;
  let service: ReportesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ReportesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía el rango y el nivel al balance de comprobación', () => {
    service.balanceComprobacion('2026-10-01', '2026-10-31', 2).subscribe();

    const req = http.expectOne(r => r.url === `${url}/balance-comprobacion`);
    expect(req.request.params.get('desde')).toBe('2026-10-01');
    expect(req.request.params.get('hasta')).toBe('2026-10-31');
    expect(req.request.params.get('nivelMaximo')).toBe('2');
  });

  it('pide el libro mayor de una cuenta', () => {
    service.libroMayor(4, '2026-10-01', '2026-10-31').subscribe();

    expect(http.expectOne(r => r.url === `${url}/libro-mayor`).request.params.get('idCuenta')).toBe('4');
  });

  it('pide el balance general con la fecha de corte', () => {
    service.balanceGeneral('2026-10-31', 4).subscribe();

    expect(http.expectOne(r => r.url === `${url}/balance-general`).request.params.get('fechaCorte')).toBe('2026-10-31');
  });
});
