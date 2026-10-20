import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Rol } from '../models/rol.model';

export interface UsuarioSesion {
  idUsuario: number;
  idEmpresa: number;
  nombre: string;
  rol: Rol;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const peticion$ = environment.authSimulada
      ? this.loginSimulado(email)
      : this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });

    return peticion$.pipe(tap(response => this.guardarSesion(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsuario(): UsuarioSesion | null {
    const datos = localStorage.getItem(USUARIO_KEY);
    if (!datos) return null;
    try {
      return JSON.parse(datos) as UsuarioSesion;
    } catch {
      return null;
    }
  }

  getRol(): Rol | null {
    return this.getUsuario()?.rol ?? null;
  }

  /** true si la ruta no exige roles o si el usuario tiene alguno de ellos. */
  tieneRol(roles: Rol[] | undefined): boolean {
    if (!roles || roles.length === 0) return true;
    const rol = this.getRol();
    return !!rol && roles.includes(rol);
  }

  private guardarSesion(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(response.usuario));
  }

  // TODO Fase 2: eliminar cuando el backend tenga POST /api/auth/login.
  private loginSimulado(email: string): Observable<LoginResponse> {
    return of<LoginResponse>({
      token: 'token-simulado',
      usuario: { idUsuario: 1, idEmpresa: 1, nombre: email.split('@')[0], rol: 'ADMIN' },
    }).pipe(delay(300));
  }
}
