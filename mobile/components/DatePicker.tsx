import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  error?: string;
}

export function DatePickerField({ label, value, onChange, mode = 'date', error }: DatePickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [show, setShow] = useState(false);
  const isDark = colorScheme === 'dark';

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    if (mode === 'time') {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
            borderColor: error ? '#d32f2f' : 'transparent',
          },
        ]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.dateText, { color: Colors[colorScheme].text }]}>
          {formatDate(value)}
        </Text>
        <FontAwesome
          name={mode === 'time' ? 'clock-o' : 'calendar'}
          size={20}
          color={isDark ? '#999' : '#666'}
        />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
        />
      )}
      {error && (
        <Text style={[styles.errorText, { color: '#d32f2f' }]}>{error}</Text>
      )}
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
    fontFamily: 'Montserrat-SemiBold',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Montserrat-Regular',
  },
});
