import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import i18n from '@/src/i18n';
import { isValidTime, parseTime } from './time';
import {
  HBA1C_INTERVAL_DAYS,
  type ReminderSettings,
} from './types';

export const REMINDER_CHANNEL_ID = 'recordatorios';
const REMINDER_KIND_PREFIX = 'reminder:';
const MAX_HBA1C_OCCURRENCES = 8;
const MAX_HBA1C_LOOKAHEAD = 40;

type NotificationContent = Notifications.NotificationContentInput;

function translate(key: string): string {
  return String(i18n.t(`profile:${key}`));
}

function isPermissionGranted(
  status: Notifications.NotificationPermissionsStatus
): boolean {
  return (
    status.granted ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export function configureNotifications(): void {
  if (Platform.OS === 'web') {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (isPermissionGranted(current)) {
    return true;
  }
  if (!current.canAskAgain) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return isPermissionGranted(requested);
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: translate('remindersChannel'),
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#95BFDF',
    enableVibrate: true,
    enableLights: true,
  });
}

function buildContent(
  title: string,
  body: string,
  kind: string,
  url: string
): NotificationContent {
  return {
    title,
    body,
    sound: 'default',
    data: { kind: `${REMINDER_KIND_PREFIX}${kind}`, url },
  };
}

async function scheduleDaily(
  content: NotificationContent,
  time: string
): Promise<void> {
  if (!isValidTime(time)) {
    return;
  }

  const { hour, minute } = parseTime(time);
  await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

async function scheduleWeekly(
  content: NotificationContent,
  weekday: number,
  time: string
): Promise<void> {
  if (!isValidTime(time) || weekday < 1 || weekday > 7) {
    return;
  }

  const { hour, minute } = parseTime(time);
  await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

function getNextHba1cDates(lastExamDate: string, time: string): Date[] {
  if (!isValidTime(time)) {
    return [];
  }

  const base = new Date(lastExamDate);
  if (Number.isNaN(base.getTime())) {
    return [];
  }

  const { hour, minute } = parseTime(time);
  const now = Date.now();
  const dates: Date[] = [];

  for (let index = 1; index <= MAX_HBA1C_LOOKAHEAD; index += 1) {
    const date = new Date(base);
    date.setDate(date.getDate() + HBA1C_INTERVAL_DAYS * index);
    date.setHours(hour, minute, 0, 0);

    if (date.getTime() > now) {
      dates.push(date);
    }
    if (dates.length === MAX_HBA1C_OCCURRENCES) {
      break;
    }
  }

  return dates;
}

async function scheduleHba1c(settings: ReminderSettings['hba1c']): Promise<void> {
  const content = buildContent(
    translate('reminderHba1cTitle'),
    translate('reminderHba1cBody'),
    'hba1c',
    '/bitacora/glucosa'
  );

  const dates = getNextHba1cDates(settings.lastExamDate, settings.time);
  await Promise.all(
    dates.map((date) =>
      Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: REMINDER_CHANNEL_ID,
        },
      })
    )
  );
}

export async function cancelScheduledReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = scheduled
    .filter((request) => {
      const kind = request.content.data?.kind;
      return (
        typeof kind === 'string' && kind.startsWith(REMINDER_KIND_PREFIX)
      );
    })
    .map((request) => request.identifier);

  await Promise.all(
    ids.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );
}

export async function syncReminderSchedules(
  settings: ReminderSettings
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await cancelScheduledReminders();

  if (!settings.enabled) {
    return;
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (!isPermissionGranted(permissions)) {
    return;
  }

  await ensureAndroidChannel();

  const tasks: Promise<void>[] = [];

  if (settings.glucose.enabled) {
    const glucoseTitle = translate('reminderGlucoseTitle');
    const glucoseUrl = '/bitacora/glucosa';
    tasks.push(
      scheduleDaily(
        buildContent(
          glucoseTitle,
          translate('reminderGlucoseFastingBody'),
          'glucose-fasting',
          glucoseUrl
        ),
        settings.glucose.fasting
      ),
      scheduleDaily(
        buildContent(
          glucoseTitle,
          translate('reminderGlucoseAfterMealBody'),
          'glucose-after-meal',
          glucoseUrl
        ),
        settings.glucose.afterMeal
      ),
      scheduleDaily(
        buildContent(
          glucoseTitle,
          translate('reminderGlucoseNocturnalBody'),
          'glucose-nocturnal',
          glucoseUrl
        ),
        settings.glucose.nocturnal
      )
    );
  }

  if (settings.insulin.enabled) {
    const insulinContent = buildContent(
      translate('reminderInsulinTitle'),
      translate('reminderInsulinBody'),
      'insulin',
      '/bitacora/insulina'
    );

    settings.insulin.times.forEach((time, index) => {
      tasks.push(
        scheduleDaily(
          { ...insulinContent, data: { ...insulinContent.data, slot: index } },
          time
        )
      );
    });
  }

  if (settings.physical.enabled) {
    tasks.push(
      scheduleWeekly(
        buildContent(
          translate('reminderPhysicalTitle'),
          translate('reminderPhysicalBody'),
          'physical',
          '/bitacora/monitoreo-fisico'
        ),
        settings.physical.weekday,
        settings.physical.time
      )
    );
  }

  if (settings.hba1c.enabled) {
    tasks.push(scheduleHba1c(settings.hba1c));
  }

  await Promise.all(tasks);
}

export function attachNotificationResponseHandler(
  onOpen: (url: string) => void
): () => void {
  if (Platform.OS === 'web') {
    return () => {};
  }

  const handleResponse = (response: Notifications.NotificationResponse) => {
    const url = response.notification.request.content.data?.url;
    if (typeof url === 'string' && url.startsWith('/')) {
      onOpen(url);
    }
  };

  const subscription =
    Notifications.addNotificationResponseReceivedListener(handleResponse);

  const lastResponse = Notifications.getLastNotificationResponse();
  if (lastResponse) {
    handleResponse(lastResponse);
    Notifications.clearLastNotificationResponse();
  }

  return () => subscription.remove();
}
