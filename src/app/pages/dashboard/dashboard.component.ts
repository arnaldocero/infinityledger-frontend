import { Component } from '@angular/core';
import { AuthService, UsuarioSesion } from '../../@core/services/auth.service';

@Component({
  selector: 'ngx-dashboard',
  template: `
    <nb-card>
      <nb-card-header>Bienvenido{{ usuario ? ', ' + usuario.nombre : '' }}</nb-card-header>
      <nb-card-body>
        <p>Aquí se mostrarán los indicadores contables: saldos, asientos del período y cartera.</p>
        <p *ngIf="usuario" class="text-hint">Rol: {{ usuario.rol }}</p>
      </nb-card-body>
    </nb-card>
  `,
})
export class DashboardComponent {
  usuario: UsuarioSesion | null;

  constructor(authService: AuthService) {
    this.usuario = authService.getUsuario();
  }
}
