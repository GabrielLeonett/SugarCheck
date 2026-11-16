import type { ReminderSettings } from './types';

/**
 * Implementación vacía de los recordatorios.
 *
 * `expo-notifications` carga módulos nativos al importarse, así que no se puede
 * evaluar en web ni en el render estático de Expo Router (Node). Este módulo
 * mantiene la misma API para que el resto de la app compile y funcione igual.
 */

export const REMINDER_CHANNEL_ID = 'recordatorios';

export function configureNotifications(): void {}

export async function ensureNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function cancelScheduledReminders(): Promise<void> {}

export async function syncReminderSchedules(
  _settings: ReminderSettings
): Promise<void> {}

export function attachNotificationResponseHandler(
  _onOpen: (url: string) => void
): () => void {
  return () => {};
}
