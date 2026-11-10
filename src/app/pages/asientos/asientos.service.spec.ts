import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { AsientosService } from './asientos.service';

describe('AsientosService', () => {
  const url = `${environment.apiUrl}/asientos`;
  let service: AsientosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AsientosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía solo los filtros que tienen valor', () => {
    service.listar({ idPeriodo: 3, estado: '' }).subscribe();

    const req = http.expectOne(r => r.url === url);
    expect(req.request.params.get('idPeriodo')).toBe('3');
    expect(req.request.params.has('estado')).toBe(false);
  });

  it('publicar y anular son POST a sus rutas', () => {
    service.publicar(7).subscribe();
    service.anular(7).subscribe();

    expect(http.expectOne(`${url}/7/publicar`).request.method).toBe('POST');
    expect(http.expectOne(`${url}/7/anular`).request.method).toBe('POST');
  });
});
