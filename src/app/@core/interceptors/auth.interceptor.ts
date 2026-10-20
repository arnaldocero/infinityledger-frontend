import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Agrega el token a las peticiones hacia la API y cierra la sesión si la API responde 401. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const esApi = req.url.startsWith(environment.apiUrl);

    const peticion = token && esApi
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(peticion).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && esApi) {
          this.authService.logout();
        }
        return throwError(error);
      }),
    );
  }
}
