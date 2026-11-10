# Base de datos local (WatermelonDB)

Este directorio es el espejo offline del esquema Prisma que vive en
`backend/prisma/schema.prisma`.

## Estructura

```
src/database/
├── index.ts          # Adaptador SQLite (iOS / Android)
├── index.web.ts      # Adaptador LokiJS + IndexedDB (web)
├── schema.ts         # Tablas y columnas (versión 1)
└── models/
    ├── User.ts
    ├── Preference.ts
    ├── ContactEmergence.ts
    ├── Imc.ts
    ├── Glucose.ts
    ├── HbA1c.ts
    ├── Conversation.ts
    ├── Message.ts
    ├── Insulina.ts
    ├── CaminoProgreso.ts
    └── index.ts      # modelClasses que consume Database
```

## Equivalencias con Prisma

| Prisma             | WatermelonDB         |
| ------------------ | -------------------- |
| `User`             | `users`              |
| `Preference`       | `preferences`        |
| `ContactEmergence` | `contact_emergences` |
| `Imc`              | `imcs`               |
| `Glucose`          | `glucose`            |
| `HbA1c`            | `hba1c`              |
| `Conversation`     | `conversations`      |
| `Message`          | `messages`           |
| `Insulina`         | `insulinas`          |
| `CaminoProgreso`   | `camino_progreso`    |

Los campos `Json` de Prisma (`roles`, `thresholds`, `insulinRatios`,
`correctionSchemas`, `basalSchemas`) se guardan como texto JSON y se leen con
el decorador `@json`.

## Uso

```ts
import { database } from '@/src/database';

const users = await database.get('users').query().fetch();
```

Toda escritura debe ir dentro de `database.write(...)`.

## Notas

- `id` es el identificador interno de WatermelonDB. Para sincronizar con el
  backend se puede asignar el UUID de Prisma a `_raw.id` antes de guardar, o
  añadir una columna `remote_id` cuando se implemente la sincronización.
- El adaptador SQLite requiere un development build (no funciona en Expo Go).
- En web se usa LokiJS para que el bundle y la app funcionen sin módulos
  nativos.
