import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';              // <-- Observable va aquí
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  usuario: {
    idUsuario: number;
    idEmpresa: number;
    nombre: string;
    rol: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Reemplaza esta URL por la de tu API en .NET (ej. https://localhost:7123/api/auth)
  private apiUrl = 'https://localhost:5001/api/auth'; 

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('id_empresa', response.usuario.idEmpresa.toString());
        })
      );
  }
}