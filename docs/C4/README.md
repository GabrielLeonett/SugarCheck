# C4 · Diagrama de Código del módulo Glucosa (Structurizr)

Un único diagrama C4 de **código (Nivel 4)** para el módulo de glucosa de SugarCheck, escrito en Structurizr DSL.

| Archivo | Contenido |
| --- | --- |
| `workspace.dsl` | Workspace de Structurizr con el modelo y la vista `codigo-glucosa` |
| `codigo-glucosa.png` | Imagen exportada del diagrama |

## Vista única

`codigo-glucosa` → **SugarCheck · Código del módulo Glucosa**

Agrupada por capas del hexágono:

1. **Entrada · NestJS** — `GlucoseController`, `CreateGlucoseDTO`, `UpdateGlucoseDTO`, `AuthGuard`, `TranslationService`
2. **Aplicación · casos de uso** — `CreateGlucose`, `GetAllGlucose`, `UpdateGlucose`
3. **Dominio** — agregado `Glucose`, puerto `GlucoseRepository`, Value Objects (`GlucoseId`, `GlucoseValue`, `GlucoseMealTag`, `GlucoseDate`, `GlucoseTime`) y errores de dominio
4. **Persistencia** — `PrismaGlucoseRepository`, `PrismaService`
5. **Shared kernel** — `Result<T, E>`, `ErrorAbstract`, `UserId`, `GenerateUUIDInterface`, `MedicalRecordEditWindow`
6. **Colaboradores** — `GetOneByIdPreference`, `CreateNotification`, `NotificationEventEmitter`

Más el contenedor `Base de datos principal` (PostgreSQL) al que llega `PrismaService`.

## Cómo visualizarlo

### Structurizr Lite (Docker)

```powershell
docker run -it --rm -p 8080:8080 `
  -v "$($PWD.Path)\docs\C4:/usr/local/structurizr" `
  structurizr/lite
```

Abrir <http://localhost:8080> → vista `codigo-glucosa`.

### Structurizr CLI

```powershell
structurizr validate -workspace docs\C4\workspace.dsl
structurizr export -workspace docs\C4\workspace.dsl -format plantuml -output docs\C4\out
```

## Nota sobre el Nivel 4

Structurizr no tiene un tipo nativo de diagrama de clases: el nivel 4 se modela como **componentes etiquetados `Code`** dentro del contenedor de la API, agrupados por capa. Es la forma estándar de representar código en C4 con Structurizr sin salir del DSL.

Se validó con Structurizr CLI `v2025.11.09`.
