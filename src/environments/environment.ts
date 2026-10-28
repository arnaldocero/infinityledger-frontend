// Configuración de desarrollo. `ng build --configuration production` usa environment.prod.ts.
export const environment = {
  production: false,
  // La API corre con `dotnet run --launch-profile http` (ver README del backend).
  apiUrl: 'http://localhost:5000/api',
};
