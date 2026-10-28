import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../@core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no llama al servicio si el formulario es inválido', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('navega al dashboard cuando el login es exitoso', () => {
    authService.login.and.returnValue(of({
      token: 't',
      expiraEn: '2026-10-27T23:00:00Z',
      usuario: { idUsuario: 1, idEmpresa: 1, nombre: 'admin', rol: 'ADMIN' },
    }));
    component.loginForm.setValue({ email: 'admin@codeledger.com', password: '123456' });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/pages/dashboard']);
    expect(component.isLoading).toBe(false);
  });

  const casosDeError: [string, HttpErrorResponse, string][] = [
    ['credenciales incorrectas (401)',
      new HttpErrorResponse({ status: 401, error: { message: 'Correo o contraseña incorrectos.' } }),
      'Correo o contraseña incorrectos.'],
    ['API caída (status 0)',
      new HttpErrorResponse({ status: 0 }),
      'No se pudo conectar con el servidor.'],
    ['demasiados intentos (429)',
      new HttpErrorResponse({ status: 429 }),
      'Demasiados intentos. Espere un minuto e intente de nuevo.'],
  ];

  casosDeError.forEach(([caso, error, mensaje]) => {
    it(`muestra el mensaje adecuado: ${caso}`, () => {
      authService.login.and.returnValue(throwError(error));
      component.loginForm.setValue({ email: 'admin@codeledger.com', password: '123456' });

      component.onSubmit();

      expect(component.errorMessage).toBe(mensaje);
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
