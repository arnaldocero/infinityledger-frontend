import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      usuario: { idUsuario: 1, idEmpresa: 1, nombre: 'admin', rol: 'ADMIN' },
    }));
    component.loginForm.setValue({ email: 'admin@codeledger.com', password: '123456' });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/pages/dashboard']);
    expect(component.isLoading).toBe(false);
  });

  it('muestra el mensaje de error de la API', () => {
    authService.login.and.returnValue(throwError({ error: { message: 'Credenciales inválidas' } }));
    component.loginForm.setValue({ email: 'admin@codeledger.com', password: '123456' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Credenciales inválidas');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
