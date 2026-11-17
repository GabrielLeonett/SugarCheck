import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import {
  exportMedicalData,
  type MedicalExportFormat,
} from '@/src/apis/exportData';
import { showErrorAlert, showSuccessAlert } from '@/src/stores/systemAlertStore';

function formatYmd(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function ExportDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  const { colors, isDark } = useTheme();
  const { i18n } = useTranslation();
  const [show, setShow] = useState(false);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) onChange(selectedDate);
  };

  const formatDate = (date: Date) => {
    const locale =
      i18n.resolvedLanguage === 'ja'
        ? 'ja-JP'
        : i18n.resolvedLanguage === 'pt'
          ? 'pt-BR'
          : i18n.resolvedLanguage === 'en'
            ? 'en-US'
            : 'es-ES';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.dateField}>
      <Text style={[styles.dateLabel, { color: colors.text.secondary }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          { backgroundColor: colors.inputBackground, borderColor: colors.border },
        ]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dateText,
            { color: value ? colors.text.primary : colors.text.disabled },
          ]}
        >
          {value ? formatDate(value) : '—'}
        </Text>
        {value ? (
          <TouchableOpacity
            onPress={() => onChange(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Limpiar fecha"
          >
            <FontAwesome name="times" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          <FontAwesome name="calendar" size={20} color={colors.text.secondary} />
        )}
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          themeVariant={isDark ? 'dark' : 'light'}
          accentColor={colors.primary.main}
        />
      )}
    </View>
  );
}

export function ExportDataCard() {
  const { t } = useTranslation(['profile', 'common']);
  const { colors } = useTheme();

  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [loading, setLoading] = useState<MedicalExportFormat | null>(null);

  const handleExport = async (format: MedicalExportFormat) => {
    if (from && to && from.getTime() > to.getTime()) {
      showErrorAlert(t('profile:exportInvalidRange'));
      return;
    }

    setLoading(format);
    try {
      await exportMedicalData(format, {
        from: from ? formatYmd(from) : undefined,
        to: to ? formatYmd(to) : undefined,
      });
      showSuccessAlert(t('profile:exportSuccess'));
    } catch (error) {
      showErrorAlert(error instanceof Error ? error.message : t('profile:exportError'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <FontAwesome name="download" size={18} color={colors.primary.main} />
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {t('profile:exportTitle')}
        </ThemedText>
      </View>

      <ThemedText muted style={styles.description}>
        {t('profile:exportDescription')}
      </ThemedText>

      <View style={styles.dateRow}>
        <View style={styles.dateColumn}>
          <ExportDateField label={t('profile:exportFrom')} value={from} onChange={setFrom} />
        </View>
        <View style={styles.dateColumn}>
          <ExportDateField label={t('profile:exportTo')} value={to} onChange={setTo} />
        </View>
      </View>

      <ThemedText muted style={styles.hint}>
        {t('profile:exportRangeHint')}
      </ThemedText>

      <Button
        title={t('profile:exportPdf')}
        onPress={() => handleExport('pdf')}
        loading={loading === 'pdf'}
        disabled={loading !== null}
      />
      <View style={styles.buttonGap} />
      <Button
        title={t('profile:exportCsv')}
        onPress={() => handleExport('csv')}
        variant="outlined"
        loading={loading === 'csv'}
        disabled={loading !== null}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { marginLeft: 8, fontSize: 16 },
  description: { fontSize: 13, marginBottom: 12 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateColumn: { flex: 1 },
  dateField: { marginBottom: 12 },
  dateLabel: { fontSize: 14, marginBottom: 6, fontFamily: Fonts.semiBold },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Shape.inputRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  dateText: { fontSize: 16, fontFamily: Fonts.regular },
  hint: { fontSize: 12, marginBottom: 16 },
  buttonGap: { height: 12 },
});
