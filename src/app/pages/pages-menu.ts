import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard Contable',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'CONTABILIDAD',
    group: true,
  },
  {
    title: 'Plan de Cuentas (PUC)',
    icon: 'book-open-outline',
    link: '/pages/plan-cuentas',
  },
  {
    title: 'Comprobantes / Asientos',
    icon: 'file-text-outline',
    link: '/pages/asientos',
    children: [
      {
        title: 'Ver Asientos',
        link: '/pages/asientos/listar',
      },
      {
        title: 'Nuevo Asiento',
        link: '/pages/asientos/crear',
      },
    ],
  },
  {
    title: 'TERCEROS Y COSTOS',
    group: true,
  },
  {
    title: 'Terceros (Clientes/Prov)',
    icon: 'people-outline',
    link: '/pages/terceros',
  },
  {
    title: 'Centros de Costo',
    icon: 'grid-outline',
    link: '/pages/centros-costo',
  },
  {
    title: 'GESTIÓN FINANCIERA',
    group: true,
  },
  {
    title: 'Facturación / Cartera',
    icon: 'shopping-bag-outline',
    link: '/pages/facturas',
  },
  {
    title: 'REPORTES Y AUDITORÍA',
    group: true,
  },
  {
    title: 'Saldos y Balances',
    icon: 'pie-chart-outline',
    link: '/pages/reportes',
  },
  {
    title: 'Logs de Auditoría',
    icon: 'shield-outline',
    link: '/pages/auditoria',
  },
];
