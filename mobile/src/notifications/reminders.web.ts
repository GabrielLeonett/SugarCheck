import type { ReminderSettings } from './types';

/**
 * Expo Notifications no está disponible en web. Esta implementación mantiene
 * la misma API para que el resto de la app compile y funcione sin errores.
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
