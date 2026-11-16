/**
 * Resolución por defecto (render estático / Node y cualquier plataforma sin
 * variante propia): recordatorios deshabilitados.
 *
 * Metro resuelve `reminders.native.ts` en iOS/Android y `reminders.web.ts` en
 * el cliente web.
 */
export * from './reminders.noop';
