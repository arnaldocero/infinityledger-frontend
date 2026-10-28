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
| `src/environments` | URL de la API (`apiUrl`) |

## Autenticación y roles

- El login llama a `POST {apiUrl}/auth/login` del backend (en desarrollo `http://localhost:5000/api`),
  que devuelve un JWT y los datos del usuario. Antes de iniciar sesión hay que levantar la API
  (ver el README del backend).
- El token y el usuario se guardan en `localStorage`. Si el token ya venció, la sesión se cierra sola.
- El interceptor agrega `Authorization: Bearer <token>` a las peticiones hacia `apiUrl` y cierra la
  sesión si la API responde 401.
- Los roles de cada sección están en `src/app/pages/pages-menu.ts`; el mismo arreglo filtra el menú
  y protege la ruta (`rolGuard`). Esto solo controla lo que se muestra: los permisos reales los
  aplica la API.
