# API de Manipulacion de Imagenes

Proyecto de referencia para la materia Topicos Especiales de Programacion en la Universidad Catolica Andres Bello. Implementa una API REST en TypeScript/Express que permite a usuarios autenticados subir imagenes y ejecutar transformaciones basadas en Sharp.

## Caracteristicas principales

- Registro e inicio de sesion con JWT firmados y contrasenas hasheadas con bcrypt.
- Endpoints protegidos para redimensionar, recortar, rotar, cambiar formato y aplicar filtros a imagenes.
- Pipeline opcional de transformaciones encadenadas en una sola peticion.
- Decorators para autenticacion y logging, demostrando Programacion Orientada a Aspectos.
- Inyeccion de dependencias en servicios, handlers y loggers.
- Logging asincrono a archivo JSON Lines (y opcion MongoDB) mediante interfaz `ILogger`.

## Requisitos previos

- Node.js 18+
- MongoDB en ejecucion (local o remoto)

## Instalacion

```bash
npm install
```

## Scripts disponibles

| Comando         | Descripcion                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Levanta el servidor con ts-node-dev        |
| `npm run build` | Compila a JavaScript en `dist/`            |
| `npm start`     | Ejecuta la version compilada (`dist`)      |

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar valores:

| Variable              | Descripcion                                        |
| --------------------- | -------------------------------------------------- |
| `PORT`                | Puerto HTTP (por defecto 3000)                     |
| `MONGO_URI`           | Cadena de conexion MongoDB                         |
| `JWT_SECRET`          | Clave para firmar tokens JWT                       |
| `JWT_EXPIRATION`      | Duracion del token (ej. `1h`, `30m`, `3600`)       |
| `MAX_FILE_SIZE_BYTES` | Limite de tamano por archivo (por defecto 10 MB)   |
| `LOG_LEVEL`           | Nivel sugerido para consumidores externos          |
| `LOG_TO_MONGO`        | `true` para habilitar `MongoLogger` (opcional)     |

## Estructura del proyecto

```
src/
  index.ts
  config/
    database.ts
  models/
    User.ts
  services/
    AuthService.ts
    ImageService.ts
  routes/
    auth.routes.ts
    image.routes.ts
  handlers/
    ResizeHandler.ts
    CropHandler.ts
    FormatHandler.ts
    RotateHandler.ts
    FilterHandler.ts
    PipelineHandler.ts
    IImageHandler.ts
  decorators/
    AuthDecorator.ts
    LoggingDecorator.ts
  logging/
    ILogger.ts
    FileLogger.ts
    CompositeLogger.ts
    MongoLogger.ts
  middleware/
    upload.ts
  errors/
    AppError.ts
  types/
    index.ts

  utils/
    validators.ts
    parseparameters.ts
```

## Uso general

1. Levantar MongoDB y crear archivo `.env`.
2. Ejecutar `npm run dev` para modo desarrollo (recarga en caliente).
3. Usar clientes como Postman, Bruno o `curl` para probar los endpoints.

## Endpoints de autenticacion

### Registrar usuario

- Metodo: `POST`
- Ruta: `/auth/register`
- Body JSON:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

- Respuesta 201:

```json
{
  "success": true,
  "data": {
    "id": "<userId>",
    "email": "user@example.com"
  },
  "timestamp": "2026-01-07T12:34:56.000Z"
}
```

### Login

- Metodo: `POST`
- Ruta: `/auth/login`
- Body JSON igual al registro
- Respuesta 200:

```json
{
  "success": true,
  "data": {
    "token": "<jwt>"
  },
  "timestamp": "2026-01-07T12:34:56.000Z"
}
```

Guardar el token y enviarlo en `Authorization: Bearer <jwt>` para los demas endpoints.

## Endpoints de imagenes (requieren JWT y multipart/form-data)

### Redimensionar `/images/resize`

- Metodo: `POST`
- Campos formulario:
  - `image`: archivo
  - `width` (opcional)
  - `height` (opcional)
  - `fit` (opcional: `cover`, `contain`, `fill`, `inside`, `outside`)

Al menos `width` o `height` debe incluirse.

### Recortar `/images/crop`

- Campos:
  - `image`
  - `left`
  - `top`
  - `width`
  - `height`

### Cambiar formato `/images/format`

- Campos:
  - `image`
  - `format`: `jpeg`, `png` o `webp`

### Rotar `/images/rotate`

- Campos:
  - `image`
  - `angle`: 90, 180 o 270 (tambien admite 0 y 360)

### Filtro `/images/filter`

- Campos:
  - `image`
  - `filter`: `blur`, `sharpen` o `grayscale`
  - `value` (opcional, solo para `blur`, valor numerico > 0)

### Pipeline `/images/pipeline`

- Campos:
  - `image`
  - `operations`: arreglo JSON (string o multipart field) con transformaciones

Ejemplo de `operations`:

```json
[
  { "type": "resize", "params": { "width": 800 } },
  { "type": "filter", "params": { "filter": "grayscale" } },
  { "type": "format", "params": { "format": "webp" } }
]
```

## Respuestas y errores

- Exito: responde con la imagen procesada (`Content-Type` acorde y `Content-Disposition: attachment`).
- Error: JSON con estructura

```json
{
  "error": "Descripcion",
  "code": "CODIGO",
  "timestamp": "ISO8601"
}
```

Codigos relevantes: 400, 401, 413, 415, 500.

## Logging

- `FileLogger` escribe en `logs/app.log` con formato JSON Lines.
- `MongoLogger` opcional usa la misma base de datos (habilitar con `LOG_TO_MONGO=true`).
- `LoggingDecorator` registra nivel `info` o `error`, parametros sanitizados, duracion y resultado.

## Pruebas rapidas con curl

```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPassword123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPassword123"}' | jq -r '.data.token')

# Resize
curl -X POST http://localhost:3000/images/resize \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@sample.jpg" \
  -F "width=800" \
  -o resized.jpg
```

## Notas adicionales

- Tipo MIME soportados: JPEG, PNG, WEBP, AVIF y TIFF.
- Limite de tamano por archivo: 10 MB (configurable por entorno).
- Los decoradores mantienen separadas las preocupaciones de seguridad y auditoria.
- Agrega nuevas operaciones implementando `IImageHandler` y envolviendolas con los mismos decorators.
