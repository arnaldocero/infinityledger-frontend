import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

import { AuthService } from '../@core/services/auth.service';
import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {

  menu: NbMenuItem[];

  constructor(authService: AuthService) {
    this.menu = this.filtrarPorRol(MENU_ITEMS, authService);
  }

  /** Quita las opciones cuyo `data.roles` no incluye el rol del usuario y los grupos que quedan vacíos. */
  private filtrarPorRol(items: NbMenuItem[], authService: AuthService): NbMenuItem[] {
    return items
      .filter(item => authService.tieneRol(item.data?.roles))
      .map(item => item.children
        ? { ...item, children: this.filtrarPorRol(item.children, authService) }
        : { ...item })
      .filter(item => !item.children || item.children.length > 0);
  }
}
