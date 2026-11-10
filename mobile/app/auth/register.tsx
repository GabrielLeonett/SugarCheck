import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { DatePickerField } from '@/components/DatePicker';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { authApi } from '@/src/apis/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    sexo: '',
    fechaNacimiento: new Date(2000, 0, 1),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: any) =>
    setFormData((previous) => ({ ...previous, [key]: value }));

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.nombre) errs.nombre = 'Nombre requerido';
    if (!formData.sexo) errs.sexo = 'Selecciona un sexo';
    if (!formData.email) errs.email = 'Correo requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Correo inválido';
    if (!formData.password) errs.password = 'Contraseña requerida';
    else if (formData.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setIsSubmitting(true);
    try {
      await authApi.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        sexo: formData.sexo,
        fechaNacimiento: formData.fechaNacimiento.toISOString(),
      });

      await login(formData.email, formData.password);
      router.push('/auth/complete-profile');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Error al registrarse';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <ThemedText type="h4" style={styles.title}>
          Crear cuenta
        </ThemedText>

        <View style={styles.form}>
          <FormInput
            label="Nombre completo"
            value={formData.nombre}
            onChangeText={(value) => updateField('nombre', value)}
            placeholder="Tu nombre"
            autoCapitalize="words"
            error={errors.nombre}
          />
          <FormInput
            label="Correo electrónico"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <FormInput
            label="Contraseña"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="••••••"
            secureTextEntry
            error={errors.password}
          />
          <FormInput
            label="Confirmar contraseña"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            placeholder="••••••"
            secureTextEntry
            error={errors.confirmPassword}
          />
          <FormInput
            label="Sexo"
            value={formData.sexo}
            onChangeText={(value) => updateField('sexo', value)}
            placeholder="masculino / femenino"
            error={errors.sexo}
          />
          <DatePickerField
            label="Fecha de nacimiento"
            value={formData.fechaNacimiento}
            onChange={(date) => updateField('fechaNacimiento', date)}
          />
        </View>

        <View style={styles.buttons}>
          <Button title="Crear cuenta" onPress={handleSubmit} loading={isSubmitting} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            ¿Ya tienes cuenta?
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7}>
            <Text style={[styles.link, { color: colors.primary.main, marginLeft: 4 }]}>
              Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  backButton: { marginBottom: 16, width: 40 },
  title: { textAlign: 'center', marginBottom: 24 },
  form: { gap: 4 },
  buttons: { marginTop: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontFamily: Fonts.regular },
  link: { fontFamily: Fonts.semiBold, fontSize: 14 },
});
