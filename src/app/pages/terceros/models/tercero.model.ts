// Refleja la tabla `terceros` de la base de datos codeledger (columnas en camelCase).

export type TipoDocumento = 'NIT' | 'CC' | 'CE' | 'PASAPORTE' | 'RUT';

export type TipoTercero = 'CLIENTE' | 'PROVEEDOR' | 'EMPLEADO' | 'OTRO';

export interface Tercero {
  idTercero: number;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  digitoVerificacion: number | null;   // solo NIT y RUT
  nombreRazonSocial: string;
  tiposTercero: TipoTercero[];
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

export const TIPOS_DOCUMENTO: { valor: TipoDocumento; nombre: string }[] = [
  { valor: 'NIT', nombre: 'NIT' },
  { valor: 'CC', nombre: 'Cédula de ciudadanía' },
  { valor: 'CE', nombre: 'Cédula de extranjería' },
  { valor: 'PASAPORTE', nombre: 'Pasaporte' },
  { valor: 'RUT', nombre: 'RUT' },
];

export const TIPOS_TERCERO: { valor: TipoTercero; nombre: string }[] = [
  { valor: 'CLIENTE', nombre: 'Cliente' },
  { valor: 'PROVEEDOR', nombre: 'Proveedor' },
  { valor: 'EMPLEADO', nombre: 'Empleado' },
  { valor: 'OTRO', nombre: 'Otro' },
];

/** NIT y RUT llevan dígito de verificación. */
export function llevaDigitoVerificacion(tipo: TipoDocumento): boolean {
  return tipo === 'NIT' || tipo === 'RUT';
}

/** Solo NIT, RUT y cédula son numéricos; CE y pasaporte admiten letras. */
export function esDocumentoNumerico(tipo: TipoDocumento): boolean {
  return tipo === 'NIT' || tipo === 'RUT' || tipo === 'CC';
}

const PESOS_DIAN = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/**
 * Dígito de verificación del NIT según la DIAN (módulo 11). Mismo algoritmo que la API,
 * que es quien lo valida; aquí solo sirve para mostrarlo mientras se escribe.
 */
export function digitoVerificacion(nit: string): number | null {
  if (!/^\d{1,15}$/.test(nit)) return null;

  let suma = 0;
  for (let i = 0; i < nit.length; i++) {
    suma += Number(nit[nit.length - 1 - i]) * PESOS_DIAN[i];
  }
  const residuo = suma % 11;
  return residuo <= 1 ? residuo : 11 - residuo;
}

/** '900123456-8' para NIT/RUT, el número solo para el resto. */
export function documentoCompleto(t: Pick<Tercero, 'numeroDocumento' | 'digitoVerificacion'>): string {
  return t.digitoVerificacion === null ? t.numeroDocumento : `${t.numeroDocumento}-${t.digitoVerificacion}`;
}
