import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService, LoginResponse } from './auth.service';
import { environment } from '../../../environments/environment';

/** JWT sin firma válida con el `exp` indicado; el frontend solo lee el payload. */
function tokenCon(expSegundos: number): string {
  const base64Url = (obj: object) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url({ sub: '1', exp: expSegundos })}.firma`;
}

const enUnaHora = () => Math.floor(Date.now() / 1000) + 3600;
const haceUnaHora = () => Math.floor(Date.now() / 1000) - 3600;

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('no tiene sesión al iniciar', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getRol()).toBeNull();
  });

  it('login envía las credenciales a la API y guarda la sesión', () => {
    const respuesta: LoginResponse = {
      token: tokenCon(enUnaHora()),
      expiraEn: new Date().toISOString(),
      usuario: { idUsuario: 1, idEmpresa: 1, nombre: 'Administrador', rol: 'ADMIN' },
    };

    service.login('admin@codeledger.com', 'secreto').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@codeledger.com', password: 'secreto' });
    req.flush(respuesta);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUsuario()).toEqual(respuesta.usuario);
  });

  it('un token vencido cuenta como sesión cerrada y se borra', () => {
    localStorage.setItem('token', tokenCon(haceUnaHora()));
    localStorage.setItem('usuario', JSON.stringify({ idUsuario: 1, idEmpresa: 1, nombre: 'x', rol: 'ADMIN' }));

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('un token mal formado cuenta como sesión cerrada', () => {
    localStorage.setItem('token', 'no-es-un-jwt');

    expect(service.isLoggedIn()).toBe(false);
  });

  it('tieneRol acepta rutas sin roles y valida el rol guardado', () => {
    localStorage.setItem('token', tokenCon(enUnaHora()));
    localStorage.setItem('usuario', JSON.stringify({ idUsuario: 1, idEmpresa: 1, nombre: 'x', rol: 'AUXILIAR' }));

    expect(service.tieneRol(undefined)).toBe(true);
    expect(service.tieneRol(['ADMIN', 'AUXILIAR'])).toBe(true);
    expect(service.tieneRol(['ADMIN'])).toBe(false);
  });
});
