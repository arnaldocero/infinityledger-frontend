import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { Rol } from '../models/rol.model';
import { AuthService } from '../services/auth.service';

/** Exige sesión iniciada; si no la hay, envía al login. */
export const authGuard: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/auth/login']);
};

/** Exige uno de los roles de `data.roles` de la ruta; si no lo tiene, envía al dashboard. */
export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const roles = route.data['roles'] as Rol[] | undefined;
  return inject(AuthService).tieneRol(roles) || inject(Router).createUrlTree(['/pages/dashboard']);
};

/** El login solo se muestra si no hay sesión. */
export const invitadoGuard: CanActivateFn = () => {
  return !inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/pages/dashboard']);
};
