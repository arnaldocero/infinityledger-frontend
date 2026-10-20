// Refleja la tabla `plan_cuentas` de la base de datos codeledger (columnas en camelCase).

export type TipoCuenta =
  | 'ACTIVO'
  | 'PASIVO'
  | 'PATRIMONIO'
  | 'INGRESO'
  | 'GASTO'
  | 'COSTO_VENTAS'
  | 'COSTO_PRODUCCION'
  | 'ORDEN';

export type Naturaleza = 'DEBITO' | 'CREDITO';

export interface CuentaContable {
  idCuenta?: number;
  codigo: string;              // Ej: '110505'
  nombreCuenta: string;        // Ej: 'Caja General'
  idCuentaPadre: number | null;
  nivel: number;               // 1 Clase, 2 Grupo, 3 Cuenta, 4 Subcuenta
  tipoCuenta: TipoCuenta;
  naturaleza: Naturaleza;
  esMovimiento: boolean;       // true = auxiliar, recibe movimientos
  pideTercero: boolean;
  pideCentroCosto: boolean;
  activo: boolean;
}

export const TIPOS_CUENTA: { valor: TipoCuenta; nombre: string; naturaleza: Naturaleza }[] = [
  { valor: 'ACTIVO', nombre: 'Activo', naturaleza: 'DEBITO' },
  { valor: 'PASIVO', nombre: 'Pasivo', naturaleza: 'CREDITO' },
  { valor: 'PATRIMONIO', nombre: 'Patrimonio', naturaleza: 'CREDITO' },
  { valor: 'INGRESO', nombre: 'Ingreso', naturaleza: 'CREDITO' },
  { valor: 'GASTO', nombre: 'Gasto', naturaleza: 'DEBITO' },
  { valor: 'COSTO_VENTAS', nombre: 'Costo de ventas', naturaleza: 'DEBITO' },
  { valor: 'COSTO_PRODUCCION', nombre: 'Costo de producción', naturaleza: 'DEBITO' },
  { valor: 'ORDEN', nombre: 'Cuentas de orden', naturaleza: 'DEBITO' },
];

/** Longitud del código PUC por nivel: 1 (clase), 2 (grupo), 4 (cuenta), 6 (subcuenta). */
const LONGITUD_POR_NIVEL: { [longitud: number]: number } = { 1: 1, 2: 2, 4: 3, 6: 4 };

/** Nivel según la longitud del código, o null si la longitud no corresponde al PUC. */
export function nivelPorCodigo(codigo: string): number | null {
  return LONGITUD_POR_NIVEL[codigo.length] ?? null;
}

/** Código de la cuenta padre: '110505' -> '1105', '1105' -> '11', '11' -> '1', '1' -> null. */
export function codigoPadre(codigo: string): string | null {
  switch (codigo.length) {
    case 6: return codigo.slice(0, 4);
    case 4: return codigo.slice(0, 2);
    case 2: return codigo.slice(0, 1);
    default: return null;
  }
}
