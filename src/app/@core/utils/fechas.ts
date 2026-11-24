/** Fecha local en formato 'aaaa-mm-dd', el que usan los input date y la API. */
export function aIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

export function hoy(): string {
  return aIso(new Date());
}

export function inicioDeMes(): string {
  const d = new Date();
  return aIso(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function inicioDeAnio(): string {
  return `${new Date().getFullYear()}-01-01`;
}
