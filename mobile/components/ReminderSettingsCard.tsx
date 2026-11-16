import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { DatePickerField } from '@/components/DatePicker';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { dateToTime, isValidTime, timeToDate } from '@/src/notifications/time';
import type {
  ReminderSettings,
} from '@/src/notifications/types';
import { useReminderStore } from '@/src/stores/reminderStore';
import {
  showErrorAlert,
  showSuccessAlert,
} from '@/src/stores/systemAlertStore';
import type { BasalSchemaItem } from '@/src/types';

const MAX_INSULIN_TIMES = 10;
const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 7];

interface ReminderSettingsCardProps {
  basalSchemas?: BasalSchemaItem[];
}

function getLocale(language: string | undefined): string {
  switch (language) {
    case 'en':
      return 'en-US';
    case 'pt':
      return 'pt-BR';
    case 'ja':
      return 'ja-JP';
    default:
      return 'es-ES';
  }
}

function getWeekdayLabel(weekday: number, locale: string): string {
  // 6 de enero de 2024 fue sábado; el día 7 fue domingo (weekday = 1).
  return new Date(2024, 0, 6 + weekday).toLocaleDateString(locale, {
    weekday: 'short',
  });
}

export function ReminderSettingsCard({
  basalSchemas,
}: ReminderSettingsCardProps) {
  const { t, i18n } = useTranslation(['profile', 'common']);
  const { colors } = useTheme();
  const settings = useReminderStore((state) => state.settings);
  const hydrated = useReminderStore((state) => state.hydrated);
  const save = useReminderStore((state) => state.save);

  const [form, setForm] = useState<ReminderSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hydrated) {
      setForm(settings);
    }
  }, [hydrated, settings]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const schemaTimes = Array.from(
      new Set(
        (basalSchemas ?? [])
          .map((item) => item.injectionTime)
          .filter(isValidTime)
      )
    )
      .sort()
      .slice(0, MAX_INSULIN_TIMES);

    if (schemaTimes.length === 0) {
      return;
    }

    setForm((previous) =>
      previous.insulin.times.length > 0
        ? previous
        : {
            ...previous,
            insulin: { ...previous.insulin, times: schemaTimes },
          }
    );
  }, [hydrated, basalSchemas]);

  if (Platform.OS === 'web') {
    return null;
  }

  const locale = getLocale(i18n.resolvedLanguage ?? i18n.language);

  const updateGlucose = (
    patch: Partial<ReminderSettings['glucose']>
  ) => {
    setForm((previous) => ({
      ...previous,
      glucose: { ...previous.glucose, ...patch },
    }));
  };

  const updateInsulinTime = (index: number, time: string) => {
    setForm((previous) => ({
      ...previous,
      insulin: {
        ...previous.insulin,
        times: previous.insulin.times.map((current, currentIndex) =>
          currentIndex === index ? time : current
        ),
      },
    }));
  };

  const removeInsulinTime = (index: number) => {
    setForm((previous) => ({
      ...previous,
      insulin: {
        ...previous.insulin,
        times: previous.insulin.times.filter(
          (_, currentIndex) => currentIndex !== index
        ),
      },
    }));
  };

  const addInsulinTime = () => {
    setForm((previous) => {
      if (previous.insulin.times.length >= MAX_INSULIN_TIMES) {
        return previous;
      }
      return {
        ...previous,
        insulin: {
          ...previous.insulin,
          times: [...previous.insulin.times, '08:00'],
        },
      };
    });
  };

  const applyBasalTimes = () => {
    const schemaTimes = Array.from(
      new Set(
        (basalSchemas ?? [])
          .map((item) => item.injectionTime)
          .filter(isValidTime)
      )
    )
      .sort()
      .slice(0, MAX_INSULIN_TIMES);

    if (schemaTimes.length === 0) {
      showErrorAlert(t('profile:remindersNoBasalTimes'));
      return;
    }

    setForm((previous) => ({
      ...previous,
      insulin: { ...previous.insulin, times: schemaTimes },
    }));
  };

  const handleSave = async () => {
    if (form.enabled && form.insulin.enabled && form.insulin.times.length === 0) {
      showErrorAlert(t('profile:remindersInsulinRequired'));
      return;
    }

    if (form.enabled && form.hba1c.enabled) {
      const lastExam = new Date(form.hba1c.lastExamDate);
      if (
        Number.isNaN(lastExam.getTime()) ||
        lastExam.getTime() > Date.now()
      ) {
        showErrorAlert(t('profile:remindersInvalidDate'));
        return;
      }
    }

    setSaving(true);
    const result = await save(form);
    setSaving(false);

    if (result === 'saved') {
      showSuccessAlert(t('profile:remindersSaved'));
      return;
    }
    if (result === 'permission-denied') {
      showErrorAlert(t('profile:remindersPermissionDenied'));
      return;
    }
    showErrorAlert(t('profile:remindersSaveError'));
  };

  const switchColors = {
    trackColor: { false: colors.divider, true: colors.primary.main },
    thumbColor: colors.background.paper,
    ios_backgroundColor: colors.divider,
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary[50] }]}>
          <FontAwesome name="bell" size={18} color={colors.primary.main} />
        </View>
        <View style={styles.headerText}>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            {t('profile:reminders')}
          </ThemedText>
          <ThemedText muted style={styles.headerHint}>
            {t('profile:remindersDescription')}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.masterRow, { borderColor: colors.divider }]}>
        <ThemedText type="defaultSemiBold" style={styles.masterLabel}>
          {t('profile:remindersEnable')}
        </ThemedText>
        <Switch
          value={form.enabled}
          onValueChange={(enabled) =>
            setForm((previous) => ({ ...previous, enabled }))
          }
          {...switchColors}
          accessibilityLabel={t('profile:remindersEnable')}
        />
      </View>

      <View style={[styles.section, { borderColor: colors.divider }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome name="tint" size={15} color={colors.info.main} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t('profile:remindersGlucose')}
            </ThemedText>
          </View>
          <Switch
            value={form.glucose.enabled}
            onValueChange={(enabled) => updateGlucose({ enabled })}
            {...switchColors}
            accessibilityLabel={t('profile:remindersGlucose')}
          />
        </View>

        {form.glucose.enabled && (
          <View style={styles.sectionBody}>
            <DatePickerField
              label={t('profile:remindersFasting')}
              mode="time"
              value={timeToDate(form.glucose.fasting)}
              onChange={(date) => updateGlucose({ fasting: dateToTime(date) })}
            />
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <DatePickerField
                  label={t('profile:remindersAfterMeal')}
                  mode="time"
                  value={timeToDate(form.glucose.afterMeal)}
                  onChange={(date) =>
                    updateGlucose({ afterMeal: dateToTime(date) })
                  }
                />
              </View>
              <View style={styles.column}>
                <DatePickerField
                  label={t('profile:remindersNocturnal')}
                  mode="time"
                  value={timeToDate(form.glucose.nocturnal)}
                  onChange={(date) =>
                    updateGlucose({ nocturnal: dateToTime(date) })
                  }
                />
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.section, { borderColor: colors.divider }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome name="eyedropper" size={15} color={colors.primary.main} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t('profile:remindersInsulin')}
            </ThemedText>
          </View>
          <Switch
            value={form.insulin.enabled}
            onValueChange={(enabled) =>
              setForm((previous) => ({
                ...previous,
                insulin: { ...previous.insulin, enabled },
              }))
            }
            {...switchColors}
            accessibilityLabel={t('profile:remindersInsulin')}
          />
        </View>

        {form.insulin.enabled && (
          <View style={styles.sectionBody}>
            <ThemedText muted style={styles.sectionHint}>
              {t('profile:remindersInsulinHint')}
            </ThemedText>

            {form.insulin.times.length === 0 && (
              <ThemedText muted style={styles.emptyText}>
                {t('profile:remindersNoInsulinTimes')}
              </ThemedText>
            )}

            {form.insulin.times.map((time, index) => (
              <View key={index} style={styles.timeRow}>
                <View style={styles.timePicker}>
                  <DatePickerField
                    mode="time"
                    value={timeToDate(time)}
                    onChange={(date) =>
                      updateInsulinTime(index, dateToTime(date))
                    }
                  />
                </View>
                <TouchableOpacity
                  onPress={() => removeInsulinTime(index)}
                  style={styles.deleteButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('common:delete')}
                >
                  <FontAwesome
                    name="trash"
                    size={18}
                    color={colors.error.main}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.insulinActions}>
              <Button
                title={t('profile:remindersAddTime')}
                onPress={addInsulinTime}
                variant="outlined"
                disabled={form.insulin.times.length >= MAX_INSULIN_TIMES}
                style={styles.insulinButton}
              />
              {(basalSchemas ?? []).length > 0 && (
                <Button
                  title={t('profile:remindersUseBasal')}
                  onPress={applyBasalTimes}
                  variant="text"
                  style={styles.insulinButton}
                />
              )}
            </View>
          </View>
        )}
      </View>

      <View style={[styles.section, { borderColor: colors.divider }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome name="heartbeat" size={15} color={colors.success.main} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t('profile:remindersPhysical')}
            </ThemedText>
          </View>
          <Switch
            value={form.physical.enabled}
            onValueChange={(enabled) =>
              setForm((previous) => ({
                ...previous,
                physical: { ...previous.physical, enabled },
              }))
            }
            {...switchColors}
            accessibilityLabel={t('profile:remindersPhysical')}
          />
        </View>

        {form.physical.enabled && (
          <View style={styles.sectionBody}>
            <ThemedText muted style={styles.sectionHint}>
              {t('profile:remindersPhysicalHint')}
            </ThemedText>
            <ThemedText style={[styles.fieldLabel, { color: colors.text.secondary }]}>
              {t('profile:remindersDay')}
            </ThemedText>
            <View style={styles.weekdayRow}>
              {WEEKDAY_VALUES.map((weekday) => {
                const selected = form.physical.weekday === weekday;
                return (
                  <TouchableOpacity
                    key={weekday}
                    onPress={() =>
                      setForm((previous) => ({
                        ...previous,
                        physical: { ...previous.physical, weekday },
                      }))
                    }
                    style={[
                      styles.weekdayChip,
                      {
                        borderColor: selected
                          ? colors.primary.main
                          : colors.border,
                        backgroundColor: selected
                          ? colors.primary.main
                          : 'transparent',
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <ThemedText
                      style={{
                        color: selected
                          ? colors.primary.contrastText
                          : colors.text.primary,
                        fontSize: 12,
                        fontFamily: Fonts.semiBold,
                      }}
                    >
                      {getWeekdayLabel(weekday, locale)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            <DatePickerField
              label={t('profile:remindersTime')}
              mode="time"
              value={timeToDate(form.physical.time)}
              onChange={(date) =>
                setForm((previous) => ({
                  ...previous,
                  physical: { ...previous.physical, time: dateToTime(date) },
                }))
              }
            />
          </View>
        )}
      </View>

      <View style={[styles.section, { borderColor: colors.divider }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome name="flask" size={15} color={colors.warning.main} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t('profile:remindersHba1c')}
            </ThemedText>
          </View>
          <Switch
            value={form.hba1c.enabled}
            onValueChange={(enabled) =>
              setForm((previous) => ({
                ...previous,
                hba1c: { ...previous.hba1c, enabled },
              }))
            }
            {...switchColors}
            accessibilityLabel={t('profile:remindersHba1c')}
          />
        </View>

        {form.hba1c.enabled && (
          <View style={styles.sectionBody}>
            <ThemedText muted style={styles.sectionHint}>
              {t('profile:remindersHba1cHint')}
            </ThemedText>
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <DatePickerField
                  label={t('profile:remindersLastExam')}
                  value={new Date(form.hba1c.lastExamDate)}
                  onChange={(date) =>
                    setForm((previous) => ({
                      ...previous,
                      hba1c: {
                        ...previous.hba1c,
                        lastExamDate: date.toISOString(),
                      },
                    }))
                  }
                />
              </View>
              <View style={styles.column}>
                <DatePickerField
                  label={t('profile:remindersTime')}
                  mode="time"
                  value={timeToDate(form.hba1c.time)}
                  onChange={(date) =>
                    setForm((previous) => ({
                      ...previous,
                      hba1c: { ...previous.hba1c, time: dateToTime(date) },
                    }))
                  }
                />
              </View>
            </View>
          </View>
        )}
      </View>

      <Button
        title={
          saving ? t('profile:remindersSaving') : t('profile:remindersSave')
        }
        onPress={handleSave}
        loading={saving}
        disabled={saving || !hydrated}
        style={styles.saveButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 16 },
  headerHint: { fontSize: 12, marginTop: 2 },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  masterLabel: { flex: 1, marginRight: 12 },
  section: {
    paddingTop: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  sectionTitle: { fontSize: 14 },
  sectionBody: { marginTop: 12, paddingBottom: 16 },
  sectionHint: { fontSize: 12, marginBottom: 12 },
  fieldLabel: { fontSize: 14, marginBottom: 6, fontFamily: Fonts.semiBold },
  twoColumns: { flexDirection: 'row', gap: 12 },
  column: { flex: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  timePicker: { flex: 1 },
  deleteButton: { padding: 12, marginTop: 2 },
  insulinActions: { marginTop: 4, gap: 4 },
  insulinButton: { paddingHorizontal: 12 },
  emptyText: { fontSize: 12, marginBottom: 12 },
  weekdayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  weekdayChip: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  saveButton: { marginTop: 16 },
});
