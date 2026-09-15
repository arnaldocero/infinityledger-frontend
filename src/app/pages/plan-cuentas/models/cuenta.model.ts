export interface CuentaContable {
    id?: number;
    codigo: string;       // Ej: '110505'
    nombre: string;       // Ej: 'Caja General'
    tipo: string;         // Ej: 'Activo', 'Pasivo', 'Patrimonio'
    nivel: number;        // Ej: 1 (Clase), 2 (Grupo), 3 (Cuenta), 4 (Subcuenta)
    permiteMovimiento: boolean;
    estado: boolean;
  }