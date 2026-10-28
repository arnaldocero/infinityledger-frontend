import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Rol } from '../models/rol.model';

export interface UsuarioSesion {
  idUsuario: number;
  idEmpresa: number;
  nombre: string;
  rol: Rol;
}

/** Respuesta de POST /api/auth/login. */
export interface LoginResponse {
  token: string;
  expiraEn: string;
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
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(response => this.guardarSesion(response)));
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/auth/login']);
  }

  /** Hay sesión si existe un token y todavía no venció. */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (this.tokenVencido(token)) {
      this.limpiarSesion();
      return false;
    }
    return true;
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

  private limpiarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  }

  /**
   * Lee el campo `exp` (segundos Unix) del JWT. Solo sirve para no mostrar pantallas con un
   * token vencido: la firma la valida la API, que responde 401 si el token no es válido.
   */
  private tokenVencido(token: string): boolean {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload));
      return typeof exp !== 'number' || exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
