# CodeLedger – Frontend

Frontend del sistema contable CodeLedger. Angular 15 + Nebular 11, construido a partir de la plantilla
[ngx-admin](https://github.com/akveo/ngx-admin) (licencia MIT, ver `LICENSE`).

## Requisitos

- Node.js y npm. El archivo `.npmrc` activa `legacy-peer-deps` por un conflicto heredado de karma/jasmine.

## Comandos

```bash
npm install
```

```bash
npm start
```

Abre http://localhost:4200. Otros comandos: `npm run build`, `npm test`, `npm run lint`.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/app/@core` | Servicios (auth), guards, interceptor HTTP y modelos compartidos |
| `src/app/@theme` | Layout, header, footer y temas de Nebular |
| `src/app/auth` | Login |
| `src/app/pages` | Módulos del sistema: dashboard, plan de cuentas, asientos, terceros, usuarios |
| `src/environments` | URL de la API (`apiUrl`) y `authSimulada` |

## Autenticación y roles

- Mientras no exista el backend, `environment.authSimulada = true`: cualquier correo y contraseña
  válidos entran como ADMIN. En la Fase 2 se cambia a `false` para usar `POST {apiUrl}/auth/login`.
- El interceptor agrega `Authorization: Bearer <token>` a las peticiones hacia `apiUrl` y cierra la
  sesión si la API responde 401.
- Los roles de cada sección están en `src/app/pages/pages-menu.ts`; el mismo arreglo filtra el menú
  y protege la ruta (`rolGuard`).
