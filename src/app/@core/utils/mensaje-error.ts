import { HttpErrorResponse } from '@angular/common/http';

/**
 * Mensaje para el usuario a partir de un error HTTP de la API.
 * La API responde `{ message }` en sus errores de negocio y ProblemDetails (`title`) en los de validación.
 */
export function mensajeDeError(err: HttpErrorResponse): string {
  if (err.status === 0) return 'No se pudo conectar con el servidor.';
  if (err.status === 403) return 'No tiene permisos para realizar esta acción.';
  if (err.status === 429) return 'Demasiados intentos. Espere un minuto e intente de nuevo.';
  return err.error?.message || err.error?.title || 'Ocurrió un error inesperado. Intente de nuevo.';
}
