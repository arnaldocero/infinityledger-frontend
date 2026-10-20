import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(AuthService);
  });

  it('no tiene sesión al iniciar', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getRol()).toBeNull();
  });

  it('tieneRol acepta rutas sin roles y valida el rol guardado', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('usuario', JSON.stringify({ idUsuario: 1, idEmpresa: 1, nombre: 'x', rol: 'AUXILIAR' }));

    expect(service.tieneRol(undefined)).toBe(true);
    expect(service.tieneRol(['ADMIN', 'AUXILIAR'])).toBe(true);
    expect(service.tieneRol(['ADMIN'])).toBe(false);
  });
});
