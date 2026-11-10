import { NbMenuItem } from '@nebular/theme';
import { Rol } from '../@core/models/rol.model';

// Roles con acceso a cada sección. pages-routing.module.ts usa estas mismas
// constantes en `data.roles`, así el menú y los guards no se desalinean.
export const ROLES_PLAN_CUENTAS: Rol[] = ['ADMIN', 'CONTADOR'];
export const ROLES_ASIENTOS: Rol[] = ['ADMIN', 'CONTADOR', 'AUXILIAR'];
export const ROLES_TERCEROS: Rol[] = ['ADMIN', 'CONTADOR', 'AUXILIAR'];
export const ROLES_CENTROS_COSTO: Rol[] = ['ADMIN', 'CONTADOR'];
export const ROLES_PERIODOS: Rol[] = ['ADMIN', 'CONTADOR'];
export const ROLES_TIPOS_COMPROBANTE: Rol[] = ['ADMIN', 'CONTADOR'];
export const ROLES_USUARIOS: Rol[] = ['ADMIN'];

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Plan de Cuentas',
    icon: 'book-outline',
    link: '/pages/plan-cuentas',
    data: { roles: ROLES_PLAN_CUENTAS },
  },
  {
    title: 'Asientos Contables',
    icon: 'edit-2-outline',
    link: '/pages/asientos',
    data: { roles: ROLES_ASIENTOS },
  },
  {
    title: 'Terceros',
    icon: 'people-outline',
    link: '/pages/terceros',
    data: { roles: ROLES_TERCEROS },
  },
  {
    title: 'Administración',
    icon: 'settings-2-outline',
    children: [
      {
        title: 'Centros de Costo',
        link: '/pages/centros-costo',
        data: { roles: ROLES_CENTROS_COSTO },
      },
      {
        title: 'Períodos Fiscales',
        link: '/pages/periodos',
        data: { roles: ROLES_PERIODOS },
      },
      {
        title: 'Tipos de Comprobante',
        link: '/pages/tipos-comprobante',
        data: { roles: ROLES_TIPOS_COMPROBANTE },
      },
      {
        title: 'Usuarios',
        link: '/pages/usuarios',
        data: { roles: ROLES_USUARIOS },
      },
    ],
  },
];
