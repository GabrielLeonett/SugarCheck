# Análisis de Arquitectura Backend — SugarCheck

> **Fecha:** 2026-07-21
> **Propósito:** Documentar la arquitectura actual del backend para alinear la implementación del Módulo de Glucosa con los estándares del proyecto.

---

## 1. Arquitectura y Estructura de Directorios

### 1.1 Patrón Arquitectónico Principal

El backend implementa **Clean Architecture** (Arquitectura Limpia / Hexagonal) con 3 capas por módulo:

```
src/
  <modulo>/
    core/          # Capa de dominio (entidades, value objects, interfaces de repositorio, errores)
    app/           # Capa de aplicación (casos de uso / use cases)
    infra/         # Capa de infraestructura (controladores NestJS, módulos, repositorios concretos, DTOs)
```

### 1.2 Estructura de Módulos Existentes

```
src/
├── app.module.ts             # Módulo raíz NestJS
├── main.ts                   # Punto de entrada (bootstrap)
├── shared/                   # Código compartido entre módulos
│   ├── core/
│   │   ├── value-objects/     # Value Objects genéricos (UserId)
│   │   └── errors/            # Errores genéricos (UserIdInvalidError)
│   ├── application/
│   │   └── ports/             # Interfaces de puertos (PasswordHasher, GenerateUUIDInterface)
│   ├── infrastructure/
│   │   ├── DTOs/              # DTOs compartidos (FindUserIdDTO)
│   │   ├── i18n/              # Internacionalización (TranslationService, traducciones)
│   │   ├── security/          # Implementaciones concretas (BcryptHasher)
│   │   ├── prisma.service.ts  # Servicio Prisma singleton
│   │   ├── generate-uuid.ts   # Generación de UUIDs
│   │   ├── exception-filter.ts# Filtro global de excepciones
│   │   └── domain-error-mapper.ts # Mapeo error dominio → HTTP
│   ├── enums/                 # Enums compartidos (Role, Sexo, Parentesco)
│   ├── error-abstract.ts      # Clase base abstracta para errores de dominio
│   ├── result.ts              # Patrón Result<T, E>
│   └── DatabaseError.ts       # Error de infraestructura
├── user/                      # Módulo de Usuario (el más completo, referencia principal)
│   ├── core/
│   │   ├── User.ts            # Entidad de dominio
│   │   ├── UserRepository.ts  # Interfaz del repositorio
│   │   ├── value-objects/     # UserName, UserEmail, UserPassword, UserUsername, etc.
│   │   └── errors/            # UserNotFoundError, UserAlreadyExists, etc.
│   ├── app/                   # SaveUser, GetAllUser, GetOneByIdUser, UpdateUser, DeleteUser, etc.
│   └── infra/
│       ├── Nest/              # user.controller.ts, user.module.ts, DTOs/
│       └── PrismaUserRepository/ # PrismaUserRepository.ts
├── IMC/                       # Módulo de IMC (más cercano al futuro módulo glucosa)
│   ├── core/
│   │   ├── Imc.ts             # Entidad con lógica de negocio (cálculo de IMC)
│   │   ├── ImcRepository.ts   # Interfaz
│   │   ├── value-objects/     # Peso, Altura, Fecha, Id_IMC
│   │   └── errors/            # ImcNotFoundError, PesoInvalidoError, etc.
│   ├── app/                   # CreateImc, GetAllImcByUserId, GetOneImcById, UpdateImc, DeleteImc
│   └── infra/
│       ├── Nest/              # imc.controller.ts, imc.module.ts, DTOs/
│       └── PrismaImcRepository/ # PrismaImcRepository.ts
├── auth/                      # Módulo de Autenticación
│   ├── core/errors/           # InvalidCredentialsError, InvalidTokenError, etc.
│   ├── app/                   # LoginUser, LoginFirebaseUser, RefreshAccessToken, Logout, ForgotPassword, ResetPassword
│   │   └── ports/             # Interfaces para cruce con user module
│   └── infra/                 # auth.controller.ts, auth.module.ts, auth.service.ts, auth.guard.ts, roles.guard.ts, etc.
├── preference/                # Módulo de Preferencias
│   ├── core/                  # Preference.ts, PreferenceRepository.ts, value-objects/, errors/
│   ├── app/                   # SavePreference, GetOneByUserIdPreference
│   └── infra/Nest/            # preference.controller.ts, preference.module.ts, DTOs/
├── contact_emergence/         # Módulo de Contactos de Emergencia
│   ├── core/                  # ContactEmergence.ts, ContactEmergenceRepository.ts, value-objects/, errors/
│   ├── app/                   # Save, GetAllByUserId, GetOneById, Update, Delete
│   └── infra/Nest/            # controller, module, DTOs/
└── notification/              # Módulo de Notificaciones
    ├── core/                  # Notification.ts, NotificationRepository.ts, value-objects/, errors/
    ├── app/                   # Create, GetAllByUser, MarkAsRead, Delete, etc.
    └── infra/                 # FirestoreNotificationRepository/, Nest/
```

### 1.3 Convenciones de Nomenclatura

| Elemento        | Convención                            | Ejemplo                          |
|-----------------|---------------------------------------|----------------------------------|
| Módulos         | kebab-case (singulares)               | `user/`, `contact_emergence/`   |
| Clases          | PascalCase                            | `SaveUser`, `PrismaUserRepository` |
| Interfaces      | PascalCase (sin prefijo "I")          | `UserRepository`, `PasswordHasher` |
| Value Objects   | PascalCase                            | `UserEmail`, `Peso`, `Id_IMC`    |
| Errores         | PascalCase, sufijo `Error`            | `UserNotFoundError`, `ImcNotFoundError` |
| DTOs            | PascalCase, sufijo `DTO`              | `CreateUserDTO`, `FindUserIdDTO` |
| Archivos        | kebab-case                            | `create-user.dto.ts`, `user.controller.ts` |
| Métodos         | camelCase                             | `run()`, `toPlain()`, `getValue()` |
| Variables       | camelCase                             | `userId`, `saveResult`           |
| Providers DI    | String tokens (entre comillas)        | `'UserRepository'`, `'CreateImc'` |
| Rutas HTTP      | kebab-case (singular)                 | `/user`, `/imc`, `/auth`         |

---

## 2. Patrones de Diseño y Buenas Prácticas

### 2.1 Patrones Identificados

| Patrón                    | Implementación                                                                 |
|---------------------------|--------------------------------------------------------------------------------|
| **Repository Pattern**    | Interfaz en `core/` (ej. `UserRepository`), implementación en `infra/` (ej. `PrismaUserRepository`) |
| **Value Object**          | Clases inmutables con constructor privado y factory `create()` que devuelve `Result` |
| **Result Pattern**        | `Result<T, E>` encapsula éxito/fallo sin excepciones. Métodos: `Result.ok()`, `Result.fail()` |
| **Use Case / Interactor** | Clases en `app/` con un único método público `run()`. Orquestan validaciones + lógica de negocio |
| **Dependency Injection**  | NestJS DI con `@Injectable()`, `@Inject('token')` y `useFactory` para los use cases |
| **Factory Method**        | Value Objects usan `static create()` como factory. `UserFactory` en tests |
| **DTO Pattern**           | Clases con decoradores `class-validator` en `infra/Nest/DTOs/` para validación en el pipe |
| **ToPlain Pattern**       | Toda entidad tiene un método `toPlain()` que devuelve un objeto plano serializable |
| **Interface Adapter**     | Puertos en `application/ports/` (ej. `PasswordHasher`) con implementaciones en `infrastructure/` |
| **Error Mapper**          | `domain-error-mapper.ts` mapea errores de dominio a códigos HTTP y códigos de error |
| **Global Exception Filter** | `GlobalExceptionFilter` captura toda excepción y devuelve respuesta JSON estandarizada |

### 2.2 Flujo Típico de una Petición

```
HTTP Request
  → Controller (NestJS) ← DTOs con class-validator
    → Use Case (app/) ← Value Objects creados con factory create()
      → Repository Interface (core/) ← Entidad de dominio
        → Repository Implementation (infra/) [Prisma]
      ← Result<T, ErrorAbstract>
    ← Result.isValid ? result.getValue() : throw result.getError()
  ← toPlain() para serializar
  → HTTP Response (JSON)
```

### 2.2 Reglas de Estilo y Convenciones

1. **Import paths usan rutas relativas** (sin aliases de módulo).
2. **Todas las entidades tienen un constructor privado-like** — se construyen _solo_ a través del factory `create()` en Value Objects.
3. La **capa `app/` nunca depende de infraestructura directamente** — solo de interfaces.
4. Los **Value Objects** son inmutables: `private constructor`, getter `value`, factory `create()`.
5. Los **errores de dominio** heredan de `ErrorAbstract` que extiende `Error`.
6. Uso de **`@Injectable()`** en implementaciones de infraestructura (repositorios, servicios).
7. **Traducciones** gestionadas por `TranslationService` (clave → idioma según `accept-language` header).
8. **Mensajes de error en español** en las capas de dominio (las traducciones se aplican en el filtro global).

---

## 3. Comunicación y API

### 3.1 Estilo de API

- **REST** sobre HTTP
- **Base URL implícita**: no hay prefijo global configurado (se puede agregar con `app.setGlobalPrefix()`)
- **Controladores**: NestJS `@Controller('nombre-modulo')`
- **Content-Type**: `application/json`

### 3.2 Convención de Rutas

| Módulo     | Ruta Base      | Endpoints                                                                 |
|------------|----------------|---------------------------------------------------------------------------|
| User       | `/user`        | `GET /`, `GET /id/:id`, `GET /email/:email`, `GET /username/:username`, `POST register`, `POST admin`, `PATCH :id`, `PATCH /email`, `DELETE :id` |
| Auth       | `/auth`        | `POST login`, `POST refresh`, `POST logout`, `POST firebase-login`, `POST forgot-password`, `POST reset-password` |
| IMC        | `/imc`         | `GET /`, `GET :id`, `POST /`, `PATCH :id`, `DELETE :id`                  |
| Preference | `/preference`  | `GET /`, `POST /`                                                         |
| Contact Emergence | (pendiente) | (por confirmar)                                                          |
| Notification | (pendiente)  | (por confirmar)                                                          |

### 3.3 Métodos HTTP y Códigos de Respuesta

| Método   | Uso                    | Códigos típicos              |
|----------|------------------------|------------------------------|
| `GET`    | Obtener recurso(s)     | `200 OK`, `404 Not Found`    |
| `POST`   | Crear recurso          | `201 Created` (o `200 OK` para auth) |
| `PATCH`  | Actualización parcial  | `200 OK`, `404 Not Found`    |
| `DELETE` | Eliminar recurso       | `204 No Content`             |

### 3.4 Formato de Respuesta de Error (Estandarizado)

```json
{
  "statusCode": 404,
  "message": "Usuario con ID x no encontrado",
  "code": "USER_NOT_FOUND",
  "timestamp": "2026-07-21T...",
  "path": "/user/id/x",
  "field": "id"
}
```

### 3.5 Validación con class-validator

- DTOs en `infra/Nest/DTOs/` usan decoradores: `@IsString`, `@IsEmail`, `@MinLength`, `@IsNumber`, `@IsUUID`, `@Type(() => Date)`, etc.
- `ValidationPipe` configurado globalmente en `main.ts` con `{ transform: true, whitelist: true, forbidNonWhitelisted: true }`.
- DTOs de actualización extienden `PartialType(CreateDTO)` para hacer todos los campos opcionales.

---

## 4. Manejo de Datos y Persistencia

### 4.1 ORM

**Prisma** v7.8.0 con adaptador PostgreSQL (`@prisma/adapter-pg` + `pg`).

### 4.2 Schema de Base de Datos (Prisma)

```prisma
model User {
  id              String      @id @default(uuid())
  name            String
  username        String      @unique
  password        String
  email           String?
  sexo            String
  roles           String[]
  createdAt       DateTime    @default(now())
  fechaNacimiento DateTime
  preference      Preference?
  contactEmergences ContactEmergence[]
  imcRecords        Imc[]
}

model Preference {
  userId        String   @id
  profileImg    String
  unitMeasure   String
  sensitivity   Float
  thresholds    Json
  insulinRatios Json
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ContactEmergence {
  id          String   @id @default(uuid())
  userId      String
  name        String
  parentesco  String
  telefono    String?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model Imc {
  id        String   @id @default(uuid())
  userId    String
  peso      Float
  altura    Float
  imcValue  Float
  fecha     DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

### 4.3 Convenciones del Schema Prisma

- **Nombres de modelos en singular** (PascalCase): `User`, `Imc`, `Preference`.
- **ID como UUID** generado por defecto: `@id @default(uuid())`.
- **Relaciones** con `onDelete: Cascade` para borrado en cascada.
- **Índices** en campos foráneos usados en búsquedas frecuentes: `@@index([userId])`.
- **Campos opcionales** se marcan con `?` (ej. `email String?`).

### 4.4 Migraciones

- Comando: `pnpm migrate:dev` (usa `.env.development`) y `pnpm migrate:test` (usa `.env.test`).
- Las migraciones se almacenan en `prisma/migrations/`.

### 4.5 PrismaService

- Singleton `@Injectable()` que extiende `PrismaClient`.
- Configuración SSL dinámica (local: false, nube: `rejectUnauthorized: false`).
- Logging de queries en desarrollo.
- Conexión automática en `onModuleInit`.

### 4.6 Transacciones

No se observa uso explícito de transacciones Prisma (`$transaction`) en los módulos existentes. El módulo `SaveUser` combina creación de usuario + preferencia sin transacción, lo cual podría ser un área de mejora.

---

## 5. Funcionalidades Transversales (Cross-Cutting Concerns)

### 5.1 Manejo de Errores Global

- **`GlobalExceptionFilter`** (`@Catch()`): captura toda excepción.
- Jerarquía de manejo:
  1. `ErrorAbstract` → usa `domain-error-mapper.ts` para código HTTP + código de error + traducción.
  2. `HttpException` de NestJS → extrae `statusCode` y `message`.
  3. `Error` genérico → `500 INTERNAL_SERVER_ERROR`.
- Respuesta estandarizada: `{ statusCode, message, code, timestamp, path, field? }`.
- Errores de infraestructura (`origin: 'infrastructure'`) se loguean con `console.error`.

### 5.2 Domain Error Mapper

- Registro centralizado de mapeos: `registerErrorMapping('UserNotFoundError', { statusCode: 404, code: 'USER_NOT_FOUND' })`.
- Cada error de dominio se registra con su nombre de clase, HTTP status y código i18n.

### 5.3 Autenticación y Autorización

| Componente       | Archivo                  | Propósito                                               |
|------------------|--------------------------|---------------------------------------------------------|
| `AuthGuard`      | `auth/infra/auth.guard.ts` | Verifica JWT desde cookie `access_token`, inyecta `req.user` |
| `OptionalAuthGuard` | `auth/infra/optionalAuth.guard.ts` | Permite acceso sin token (invitado) |
| `RolesGuard`     | `auth/infra/roles.guard.ts` | Verifica roles desde `@Roles()` decorator + `req.user.roles` |
| `@Roles()`       | `auth/infra/roles.decorator.ts` | Decorador que marca los roles requeridos |
| `JwtModule`      | `auth/infra/auth.module.ts` | Configura JWT con secret desde env y expiración 1h |

- **JWT almacenado en cookies HttpOnly** (no localStorage). Doble token:
  - `access_token`: 15 min.
  - `refresh_token`: 7 días.
- **Firebase Auth** soportado como alternativa (login con token de Firebase).
- **Roles existentes**: `guerrero`, `admin` (definidos en `Role` enum).

### 5.4 Internacionalización (i18n)

- `TranslationService` global (módulo `@Global()`).
- Idiomas soportados: `es`, `en`, `pt`, `ja`.
- Resolución de idioma desde header `accept-language` o `x-locale`.
- Claves de traducción como `'USER_NOT_FOUND'`, `'LOGIN_SUCCESS'`.

### 5.5 Seguridad (Middleware/Interceptors)

- **Helmet** configurado en `main.ts` (CSP, etc.).
- **Cookie-parser** para leer cookies.
- **CORS** configurado con `credentials: true` y origen desde variable de entorno.
- **CSRF** comentado (preparado para futura activación).
- **`ValidationPipe`** global (whitelist + forbidNonWhitelisted).

### 5.6 Configuración por Entorno

- Archivos: `.env.development`, `.env.test`, `.env.production`.
- Cargado por `@nestjs/config` con `envFilePath` dinámico según `NODE_ENV`.

---

## 6. Estructura de Tests

| Tipo              | Ubicación                         | Stack                          |
|-------------------|-----------------------------------|--------------------------------|
| Unit tests        | `test/<modulo>/unit/`             | Jest + mocks manuales          |
| Integration tests | `test/<modulo>/integration/`      | Jest (config `jest-int.json`)  |
| E2E tests         | `test/<modulo>/e2e/`              | Supertest + NestJS Testing     |
| Fixtures          | `test/<modulo>/fixtures/`         | `UserFactory` con Faker        |
| Mocks             | `test/<modulo>/mocks/`            | Implementaciones en memoria    |

Convenciones de tests:
- `test/<modulo>/unit/<use-case>.spec.ts`
- `test/<modulo>/integration/<modulo>-prisma.spec.ts`
- `test/<modulo>/e2e/<modulo>-controller.e2e-spec.ts`
- `describe('SaveUser UseCase', () => { ... })` con AAA (Arrange-Act-Assert).

---

## 7. Checklist de Implementación para el Módulo de Glucosa

Basado estrictamente en los patrones y reglas identificados:

### 7.1 Estructura de Archivos (Clean Architecture)

```
src/glucose/
├── core/                              # Capa de dominio
│   ├── Glucose.ts                     # Entidad de dominio (extends nada, implementa toPlain())
│   ├── GlucoseRepository.ts           # Interfaz del repositorio (métodos devuelven Result)
│   ├── value-objects/
│   │   ├── GlucoseId.ts               # Value Object ID (constructor privado + create())
│   │   ├── GlucoseValue.ts            # Valor de glucosa en mg/dL
│   │   ├── GlucoseDate.ts             # Fecha/hora del registro
│   │   ├── MealTag.ts                 # Etiqueta de comida (antes/después)
│   │   └── ... (otros según dominio)
│   └── errors/
│       ├── GlucoseNotFoundError.ts    # Error extends ErrorAbstract
│       ├── GlucoseValueInvalidError.ts
│       └── ... (errores de dominio específicos)
├── app/                               # Casos de uso
│   ├── CreateGlucose.ts              # Crear registro (orquesta validaciones + repositorio)
│   ├── GetAllGlucoseByUserId.ts      # Obtener todos por usuario
│   ├── GetOneGlucoseById.ts          # Obtener uno por ID
│   ├── UpdateGlucose.ts              # Actualizar registro
│   └── DeleteGlucose.ts              # Eliminar registro
└── infra/
    ├── Nest/
    │   ├── glucose.controller.ts     # @Controller('glucose'), @UseGuards(AuthGuard)
    │   ├── glucose.module.ts         # @Module con providers via useFactory
    │   └── DTOs/
    │       ├── create-glucose.dto.ts  # class-validator decorators
    │       └── update-glucose.dto.ts  # extends PartialType(CreateGlucoseDTO)
    └── PrismaGlucoseRepository/
        └── PrismaGlucoseRepository.ts # implements GlucoseRepository, toDomain() + toPersistence()
```

### 7.2 Prisma Schema

Agregar modelo `Glucose` en `prisma/schema.prisma`:

```prisma
model Glucose {
  id        String   @id @default(uuid())
  userId    String
  value     Float    // mg/dL
  date      DateTime
  mealTag   String?  // 'before_breakfast', 'after_lunch', etc.
  notes     String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([userId, date])
}
```

### 7.3 Registro en AppModule

- Importar `GlucoseModule` en `src/app.module.ts`.

### 7.4 Domain Error Mapper

Registrar en `shared/infrastructure/domain-error-mapper.ts`:

```typescript
registerErrorMapping('GlucoseNotFoundError', { statusCode: HttpStatus.NOT_FOUND, code: 'GLUCOSE_NOT_FOUND' });
registerErrorMapping('GlucoseValueInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_GLUCOSE_VALUE' });
// ... otros errores específicos
```

### 7.5 API Endpoints (REST)

| Método   | Ruta               | Auth       | Descripción                         |
|----------|--------------------|------------|-------------------------------------|
| `GET`    | `/glucose`         | AuthGuard  | Obtener todos los registros del usuario autenticado |
| `GET`    | `/glucose/:id`     | AuthGuard  | Obtener un registro por ID          |
| `POST`   | `/glucose`         | AuthGuard  | Crear nuevo registro de glucosa     |
| `PATCH`  | `/glucose/:id`     | AuthGuard  | Actualizar registro existente       |
| `DELETE` | `/glucose/:id`     | AuthGuard  | Eliminar registro (204 No Content)  |

### 7.6 Estructura de Tests

```
test/glucose/
├── unit/
│   ├── create-glucose.use-case.spec.ts
│   ├── get-all-glucose.use-case.spec.ts
│   ├── get-one-glucose.use-case.spec.ts
│   ├── update-glucose.use-case.spec.ts
│   └── delete-glucose.use-case.spec.ts
├── integration/
│   └── glucose-prisma.spec.ts
├── e2e/
│   └── glucose-controller.e2e-spec.ts
├── mocks/
│   ├── glucose-repository.mock.ts
│   └── ... (otros mocks)
└── fixtures/
    └── glucose.fixture.ts              # GlucoseFactory con faker
```

### 7.7 Reglas a Seguir (Checklist Final)

- [ ] **Singular**: nombre del módulo `glucose` (no `glucoses`).
- [ ] **userId** se extrae de `req.user.sub` (JWT) no del body.
- [ ] **Result Pattern** en todos los métodos del repositorio y casos de uso.
- [ ] **Value Objects** con constructor privado + `static create()` devolviendo `Result`.
- [ ] **Errores de dominio** heredan de `ErrorAbstract`.
- [ ] **toPlain()** en la entidad `Glucose` para serialización.
- [ ] **DTOs** con `class-validator` en `infra/Nest/DTOs/`.
- [ ] **UpdateDTO** extiende `PartialType(CreateGlucoseDTO)`.
- [ ] **Provider DI** con string tokens + `useFactory` en el módulo.
- [ ] **@UseGuards(AuthGuard)** en el controlador (a nivel clase o por endpoint).
- [ ] **PrismaRepository** implementa `toDomain()` y `toPersistence()`.
- [ ] **Errores registrados** en `domain-error-mapper.ts`.
- [ ] **Prisma schema** con modelo `Glucose` + `@@index([userId])`.
- [ ] **Traducciones** agregadas en `translations/` (claves i18n).
- [ ] **Tests unitarios** con mocks en memoria + `UserFactory`.
- [ ] **Tests de integración** con Prisma real.
- [ ] **No comentarios** en código de producción (seguir estilo existente).
- [ ] **No prefijos "I"** en interfaces.
