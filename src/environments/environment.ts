// Configuración de desarrollo. `ng build --configuration production` usa environment.prod.ts.
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api',
  // Mientras no exista el backend (Fase 2), el login se simula en AuthService.
  authSimulada: true,
};
