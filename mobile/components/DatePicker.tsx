import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

import { Fonts, Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  error?: string;
}

export function DatePickerField({ label, value, onChange, mode = 'date', error }: DatePickerProps) {
  const { i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const [show, setShow] = useState(false);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const locale = i18n.resolvedLanguage === 'ja'
      ? 'ja-JP'
      : i18n.resolvedLanguage === 'pt'
        ? 'pt-BR'
        : i18n.resolvedLanguage === 'en'
          ? 'en-US'
          : 'es-ES';
    if (mode === 'time') {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.error.main : colors.border,
          },
        ]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dateText, { color: colors.text.primary }]}>{formatDate(value)}</Text>
        <FontAwesome
          name={mode === 'time' ? 'clock-o' : 'calendar'}
          size={20}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
          themeVariant={isDark ? 'dark' : 'light'}
          accentColor={colors.primary.main}
        />
      )}

      {error && <Text style={[styles.errorText, { color: colors.error.main }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: Fonts.semiBold,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Shape.inputRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  dateText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.regular,
  },
});
