/**
 * Texto CSV que Excel abre directamente: separador ';' (el que usa Excel en español)
 * y números con coma decimal. Las celdas con ';', comillas o saltos de línea van entre comillas.
 */
export function contenidoCsv(encabezados: string[], filas: (string | number | null)[][]): string {
  const celda = (valor: string | number | null): string => {
    if (valor === null || valor === undefined) return '';
    const texto = typeof valor === 'number' ? valor.toFixed(2).replace('.', ',') : valor;
    return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };

  return [encabezados, ...filas].map(fila => fila.map(celda).join(';')).join('\r\n');
}

/** Descarga el CSV; el BOM inicial hace que Excel respete las tildes. */
export function exportarCsv(nombreArchivo: string, encabezados: string[], filas: (string | number | null)[][]): void {
  const archivo = new Blob(['﻿' + contenidoCsv(encabezados, filas)], { type: 'text/csv;charset=utf-8' });

  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
