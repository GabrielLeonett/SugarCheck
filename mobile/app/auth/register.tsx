import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { DatePickerField } from '@/components/DatePicker';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/src/stores/authStore';
import { authApi } from '@/src/apis/auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
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
    setFormData((prev) => ({ ...prev, [key]: value }));

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.nombre) errs.nombre = 'Nombre requerido';
    if (!formData.sexo) errs.sexo = 'Selecciona un sexo';
    if (!formData.email) errs.email = 'Correo requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Correo inválido';
    if (!formData.password) errs.password = 'Contraseña requerida';
    else if (formData.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al registrarse';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back() as any} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 24 }}>
          Crear cuenta
        </ThemedText>

        <View style={styles.form}>
          <FormInput label="Nombre completo" value={formData.nombre} onChangeText={(v) => updateField('nombre', v)} placeholder="Tu nombre" error={errors.nombre} />
          <FormInput label="Correo electrónico" value={formData.email} onChangeText={(v) => updateField('email', v)} placeholder="correo@ejemplo.com" keyboardType="email-address" error={errors.email} />
          <FormInput label="Contraseña" value={formData.password} onChangeText={(v) => updateField('password', v)} placeholder="••••••" secureTextEntry error={errors.password} />
          <FormInput label="Confirmar contraseña" value={formData.confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)} placeholder="••••••" secureTextEntry error={errors.confirmPassword} />
          <FormInput label="Sexo" value={formData.sexo} onChangeText={(v) => updateField('sexo', v)} placeholder="masculino / femenino" error={errors.sexo} />
          <DatePickerField label="Fecha de nacimiento" value={formData.fechaNacimiento} onChange={(d) => updateField('fechaNacimiento', d)} />
        </View>

        <View style={styles.buttons}>
          <Button title="Crear cuenta" onPress={handleSubmit} loading={isSubmitting} />
        </View>

        <View style={styles.footer}>
          <Text style={{ color: isDark ? '#aaa' : '#666', fontFamily: 'Montserrat-Regular' }}>
            ¿Ya tienes cuenta?
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login' as any)}>
            <Text style={[styles.link, { color: Colors[colorScheme].tint, marginLeft: 4 }]}>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 16, width: 40 },
  form: { gap: 4 },
  buttons: { marginTop: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  link: { fontFamily: 'Montserrat-SemiBold', fontSize: 14 },
});
