// Refleja las tablas `asientos_encabezado` y `asientos_detalle` (vía /api/asientos).

export type EstadoAsiento = 'BORRADOR' | 'PUBLICADO' | 'ANULADO';

export interface AsientoResumen {
  idAsiento: number;
  idTipoComprobante: number;
  comprobante: string;          // 'ING-0004'
  numeroComprobante: number;
  fechaAsiento: string;         // 'aaaa-mm-dd'
  idPeriodo: number;
  conceptoGeneral: string;
  estado: EstadoAsiento;
  totalDebe: number;
  totalHaber: number;
}

export interface LineaAsiento {
  idAsientoDetalle: number;
  idCuenta: number;
  codigoCuenta: string;
  nombreCuenta: string;
  idTercero: number | null;
  nombreTercero: string | null;
  idCentroCosto: number | null;
  codigoCentroCosto: string | null;
  concepto: string | null;
  debe: number;
  haber: number;
}

export interface Asiento extends AsientoResumen {
  lineas: LineaAsiento[];
}

export interface LineaAsientoGuardar {
  idCuenta: number;
  idTercero: number | null;
  idCentroCosto: number | null;
  concepto: string | null;
  debe: number;
  haber: number;
}

export interface GuardarAsiento {
  idTipoComprobante: number;
  fechaAsiento: string;
  conceptoGeneral: string;
  lineas: LineaAsientoGuardar[];
  /** true: se publica al guardar (la API exige cuadre). false: queda en borrador. */
  publicar: boolean;
}

export interface FiltroAsientos {
  idPeriodo?: number | null;
  estado?: EstadoAsiento | '' | null;
}

export const ESTADOS_ASIENTO: { valor: EstadoAsiento; nombre: string; clase: string }[] = [
  { valor: 'BORRADOR', nombre: 'Borrador', clase: 'badge-warning' },
  { valor: 'PUBLICADO', nombre: 'Publicado', clase: 'badge-success' },
  { valor: 'ANULADO', nombre: 'Anulado', clase: 'badge-secondary' },
];

/** Redondea a centavos para comparar totales sin errores de coma flotante. */
export function redondear(valor: number): number {
  return Math.round((valor || 0) * 100) / 100;
}
