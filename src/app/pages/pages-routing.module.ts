import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { authGuard, rolGuard } from '../@core/guards/auth.guard';
import { ROLES_ASIENTOS, ROLES_PLAN_CUENTAS, ROLES_TERCEROS, ROLES_USUARIOS } from './pages-menu';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  canActivate: [authGuard],
  children: [
    {
      path: 'dashboard',
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    },
    {
      path: 'asientos',
      canActivate: [rolGuard],
      data: { roles: ROLES_ASIENTOS },
      loadChildren: () => import('./asientos/asientos.module').then(m => m.AsientosModule),
    },
    {
      path: 'plan-cuentas',
      canActivate: [rolGuard],
      data: { roles: ROLES_PLAN_CUENTAS },
      loadChildren: () => import('./plan-cuentas/plan-cuentas.module').then(m => m.PlanCuentasModule),
    },
    {
      path: 'terceros',
      canActivate: [rolGuard],
      data: { roles: ROLES_TERCEROS },
      loadChildren: () => import('./terceros/terceros.module').then(m => m.TercerosModule),
    },
    {
      path: 'usuarios',
      canActivate: [rolGuard],
      data: { roles: ROLES_USUARIOS },
      loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule),
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: '**',
      redirectTo: 'dashboard',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
