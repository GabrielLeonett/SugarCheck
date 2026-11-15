workspace "SugarCheck" "Arquitectura de SugarCheck — Nivel 4: código del módulo Glucosa." {

    model {

        sugarcheck = softwareSystem "SugarCheck" "Aplicación de control de diabetes infantil con gamificación." {

            api = container "API REST + WebSocket" "Núcleo de negocio con arquitectura hexagonal: autenticación, registros clínicos, preferencias, gamificación, IA, sincronización y exportación." "NestJS 11 + Node.js 20+, TypeScript" "BackendApplication" {

                # ==============================================================
                # Código · módulo Glucosa (backend/src/glucose)
                # ==============================================================

                group "1 · Entrada · NestJS" {

                    glucoseController = component "GlucoseController" "Expone GET /glucose, POST /glucose y PATCH /glucose/:id. Valida el request, aplica AuthGuard y delega en casos de uso." "NestJS Controller" "Code,Entrada"
                    createGlucoseDto = component "CreateGlucoseDTO" "valueMgdl, mealTag, date, time. Validado por class-validator." "TypeScript DTO" "Code,Entrada"
                    updateGlucoseDto = component "UpdateGlucoseDTO" "Campos opcionales para edición parcial." "TypeScript DTO" "Code,Entrada"
                    authGuard = component "AuthGuard" "Valida el JWT y resuelve el UserId del request." "NestJS Guard" "Code,Entrada"
                    translationService = component "TranslationService" "Traduce mensajes de error y alertas a ES/EN/PT/JA." "NestJS Service" "Code,Entrada"
                }

                group "2 · Aplicación · casos de uso" {

                    createGlucose = component "CreateGlucose" "Valida Value Objects, construye el agregado, persiste y genera alerta por umbral." "TypeScript Use Case" "Code,Aplicacion"
                    getAllGlucose = component "GetAllGlucose" "Lista los registros de glucosa del usuario autenticado." "TypeScript Use Case" "Code,Aplicacion"
                    updateGlucose = component "UpdateGlucose" "Edita un registro dentro de la ventana médica de 15 días." "TypeScript Use Case" "Code,Aplicacion"
                }

                group "3 · Dominio · agregado y value objects" {

                    glucose = component "Glucose" "Agregado raíz: id, userId, valueMgdl, mealTag, date, time, createdAt y alert." "TypeScript Aggregate Root" "Code,Dominio"
                    glucoseRepository = component "GlucoseRepository" "Puerto de salida: getAllByUserId, getOneById, save, update y delete." "TypeScript Interface" "Code,Dominio"
                    glucoseId = component "GlucoseId" "Value Object del identificador de glucosa." "TypeScript Value Object" "Code,Dominio"
                    glucoseValue = component "GlucoseValue" "Value Object: valida el rango de glucosa (1–999 mg/dL)." "TypeScript Value Object" "Code,Dominio"
                    glucoseMealTag = component "GlucoseMealTag" "Value Object: etiqueta de comida asociada a la medición." "TypeScript Value Object" "Code,Dominio"
                    glucoseDate = component "GlucoseDate" "Value Object: fecha de la medición." "TypeScript Value Object" "Code,Dominio"
                    glucoseTime = component "GlucoseTime" "Value Object: hora de la medición (HH:mm)." "TypeScript Value Object" "Code,Dominio"
                    glucoseNotFoundError = component "GlucoseNotFoundError" "Error de dominio cuando el registro no existe." "TypeScript Error" "Code,Dominio"
                    glucoseValueInvalidError = component "GlucoseValueInvalidError" "Error de dominio cuando el valor está fuera de rango." "TypeScript Error" "Code,Dominio"
                }

                group "4 · Persistencia · adaptador Prisma" {

                    prismaGlucoseRepository = component "PrismaGlucoseRepository" "Implementa GlucoseRepository y traduce entre dominio y Prisma." "TypeScript Adapter" "Code,Persistencia"
                    prismaService = component "PrismaService" "Cliente Prisma 7 con el pool de conexiones a PostgreSQL." "Prisma 7 + pg" "Code,Persistencia"
                }

                group "5 · Shared kernel" {

                    result = component "Result<T, E>" "Result Pattern: ok/fail, isValid, getValue y getError. Evita excepciones para errores de negocio." "TypeScript" "Code,Shared"
                    errorAbstract = component "ErrorAbstract" "Error base de dominio con name, code, field y origin." "TypeScript" "Code,Shared"
                    userId = component "UserId" "Value Object compartido del identificador de usuario." "TypeScript Value Object" "Code,Shared"
                    generateUuid = component "GenerateUUIDInterface" "Puerto para generar identificadores únicos." "TypeScript Interface" "Code,Shared"
                    editWindow = component "MedicalRecordEditWindow" "Política que limita la edición de registros médicos a 15 días." "TypeScript Policy" "Code,Shared"
                }

                group "6 · Colaboradores de otros módulos" {

                    getOneByIdPreference = component "GetOneByIdPreference" "Módulo de preferencias: devuelve los umbrales de alerta." "TypeScript Use Case" "Code,Colaboradores"
                    createNotification = component "CreateNotification" "Módulo de notificaciones: persiste y emite la alerta." "TypeScript Use Case" "Code,Colaboradores"
                    notificationEmitter = component "NotificationEventEmitter" "Puerto de emisión en tiempo real (namespace /notifications)." "TypeScript Interface" "Code,Colaboradores"
                }
            }

            database = container "Base de datos principal" "Glucosa, HbA1c, usuarios, preferencias, insulina, IMC, contactos y notificaciones." "PostgreSQL + Prisma 7" "Database"
        }

        # ------------------------------------------------------------------
        # Relaciones · entrada
        # ------------------------------------------------------------------
        glucoseController -> createGlucose "inyecta"
        glucoseController -> getAllGlucose "inyecta"
        glucoseController -> updateGlucose "inyecta"
        glucoseController -> authGuard "@UseGuards"
        glucoseController -> translationService "usa"
        glucoseController -> createGlucoseDto "recibe"
        glucoseController -> updateGlucoseDto "recibe"

        # ------------------------------------------------------------------
        # Relaciones · aplicación
        # ------------------------------------------------------------------
        createGlucose -> glucoseRepository "depende de"
        createGlucose -> generateUuid "genera IDs"
        createGlucose -> getOneByIdPreference "lee umbrales"
        createGlucose -> createNotification "crea alerta"
        createGlucose -> glucose "construye"
        createGlucose -> glucoseValueInvalidError "retorna"

        getAllGlucose -> glucoseRepository "depende de"
        updateGlucose -> glucoseRepository "depende de"
        updateGlucose -> editWindow "valida ventana"
        updateGlucose -> glucoseNotFoundError "retorna"

        # ------------------------------------------------------------------
        # Relaciones · dominio
        # ------------------------------------------------------------------
        glucose -> glucoseId "compone"
        glucose -> userId "compone"
        glucose -> glucoseValue "compone"
        glucose -> glucoseMealTag "compone"
        glucose -> glucoseDate "compone"
        glucose -> glucoseTime "compone"

        # ------------------------------------------------------------------
        # Relaciones · persistencia y shared kernel
        # ------------------------------------------------------------------
        prismaGlucoseRepository -> glucoseRepository "implementa"
        prismaGlucoseRepository -> prismaService "usa"
        prismaGlucoseRepository -> glucose "traduce a dominio"
        prismaService -> database "SQL" "TCP"
        glucoseRepository -> result "retorna"
        prismaGlucoseRepository -> result "retorna"
        result -> errorAbstract "contiene"
        glucoseNotFoundError -> errorAbstract "extiende"
        glucoseValueInvalidError -> errorAbstract "extiende"

        # ------------------------------------------------------------------
        # Relaciones · colaboradores
        # ------------------------------------------------------------------
        createNotification -> notificationEmitter "emite"
    }

    views {

        # ------------------------------------------------------------------
        # Único diagrama · Nivel 4 · Código del módulo Glucosa
        # ------------------------------------------------------------------
        component api "codigo-glucosa" "SugarCheck · Código del módulo Glucosa" {
            include *
            autolayout lr 500 300
        }

        styles {
            element "Code" {
                background #FFFFFF
                color #000000
                fontSize 13
            }
            element "Entrada" {
                background #DDEBF7
                stroke #2E6DA4
            }
            element "Aplicacion" {
                background #E2EFDA
                stroke #548235
            }
            element "Dominio" {
                background #FFF2CC
                stroke #BF9000
            }
            element "Persistencia" {
                background #FCE4D6
                stroke #C55A11
            }
            element "Shared" {
                background #EDEDED
                stroke #7F7F7F
            }
            element "Colaboradores" {
                background #E4DFEC
                stroke #7030A0
            }
            element "Database" {
                shape Cylinder
                background #438DD5
                color #FFFFFF
            }
            relationship "Relationship" {
                routing Direct
                fontSize 12
            }
        }
    }
}
