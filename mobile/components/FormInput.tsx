import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Fonts, Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface FormInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  autoCapitalize = 'none',
}: FormInputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error.main
    : focused
      ? colors.primary.main
      : colors.border;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>}

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: editable ? colors.inputBackground : colors.action.disabledBackground,
              color: colors.text.primary,
              borderColor,
              minHeight: multiline ? numberOfLines * 24 + 20 : 48,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          autoCapitalize={autoCapitalize}
          selectionColor={colors.primary.main}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword((previous) => !previous)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <FontAwesome
              name={showPassword ? 'eye' : 'eye-slash'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

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
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderRadius: Shape.inputRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Fonts.regular,
    borderWidth: 1.5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.regular,
  },
});
