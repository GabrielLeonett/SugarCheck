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
import { contactEmergenceApi } from '@/src/apis/contact-emergence';
import { preferenceApi } from '@/src/apis/preference';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const STEPS = ['Cuenta', 'Salud', 'Contacto'];

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const login = useAuthStore((s) => s.login);

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    sexo: '',
    fechaNacimiento: new Date(2000, 0, 1),
    peso: '',
    talla: '',
    glucosaMin: '',
    glucosaMax: '',
    nombreGuardian: '',
    parentesco: '',
    telefono: '',
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

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.peso) errs.peso = 'Peso requerido';
    if (!formData.talla) errs.talla = 'Talla requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) return;
    if (activeStep === 1 && !validateStep2()) return;
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const registerResponse = await authApi.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        sexo: formData.sexo,
        fechaNacimiento: formData.fechaNacimiento.toISOString(),
      });

      await login(formData.email, formData.password);

      try {
        const userId = registerResponse.user?.id || useAuthStore.getState().user?.id;
        if (userId) {
          await preferenceApi.savePreferences({
            userId,
            profileImg: 'default',
            unitMeasure: 'mg/dL',
            thresholds: {
              hypo: Number(formData.glucosaMin) || 70,
              hiper: Number(formData.glucosaMax) || 180,
            },
            insulinRatios: { breakfast: 1, lunch: 1, dinner: 1 },
            sensitivity: 1,
            locale: 'es',
            theme: 'light',
          } as any);
        }
      } catch {}

      if (formData.nombreGuardian) {
        try {
          await contactEmergenceApi.create({
            name: formData.nombreGuardian,
            parentesco: formData.parentesco || 'otro',
            telefono: formData.telefono || undefined,
          });
        } catch {}
      }

      Alert.alert('¡Registro exitoso!', 'Bienvenido a Guerreros Azules');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al registrarse';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor:
                  index <= activeStep ? Colors[colorScheme].tint : isDark ? '#333' : '#e0e0e0',
              },
            ]}
          >
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              { color: index <= activeStep ? Colors[colorScheme].tint : isDark ? '#666' : '#999' },
            ]}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <>
      <FormInput label="Nombre completo" value={formData.nombre} onChangeText={(v) => updateField('nombre', v)} placeholder="Tu nombre" error={errors.nombre} />
      <FormInput label="Correo electrónico" value={formData.email} onChangeText={(v) => updateField('email', v)} placeholder="correo@ejemplo.com" keyboardType="email-address" error={errors.email} />
      <FormInput label="Contraseña" value={formData.password} onChangeText={(v) => updateField('password', v)} placeholder="••••••" secureTextEntry error={errors.password} />
      <FormInput label="Confirmar contraseña" value={formData.confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)} placeholder="••••••" secureTextEntry error={errors.confirmPassword} />
      <FormInput label="Sexo" value={formData.sexo} onChangeText={(v) => updateField('sexo', v)} placeholder="masculino / femenino" error={errors.sexo} />
      <DatePickerField label="Fecha de nacimiento" value={formData.fechaNacimiento} onChange={(d) => updateField('fechaNacimiento', d)} />
    </>
  );

  const renderStep2 = () => (
    <>
      <FormInput label="Peso (kg)" value={formData.peso} onChangeText={(v) => updateField('peso', v)} placeholder="Ej: 70" keyboardType="numeric" error={errors.peso} />
      <FormInput label="Talla (cm)" value={formData.talla} onChangeText={(v) => updateField('talla', v)} placeholder="Ej: 170" keyboardType="numeric" error={errors.talla} />
      <FormInput label="Glucosa mínima (hipo)" value={formData.glucosaMin} onChangeText={(v) => updateField('glucosaMin', v)} placeholder="Ej: 70" keyboardType="numeric" />
      <FormInput label="Glucosa máxima (hiper)" value={formData.glucosaMax} onChangeText={(v) => updateField('glucosaMax', v)} placeholder="Ej: 180" keyboardType="numeric" />
    </>
  );

  const renderStep3 = () => (
    <>
      <FormInput label="Nombre del contacto" value={formData.nombreGuardian} onChangeText={(v) => updateField('nombreGuardian', v)} placeholder="Nombre del familiar/amigo" />
      <FormInput label="Parentesco" value={formData.parentesco} onChangeText={(v) => updateField('parentesco', v)} placeholder="madre, padre, tutor, otro" />
      <FormInput label="Teléfono (opcional)" value={formData.telefono} onChangeText={(v) => updateField('telefono', v)} placeholder="+58 412..." keyboardType="phone-pad" />
    </>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back() as any} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 24 }}>
          Crear cuenta
        </ThemedText>

        {renderStepIndicator()}

        <View style={styles.form}>
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </View>

        <View style={styles.buttons}>
          {activeStep > 0 && (
            <Button title="Atrás" onPress={handleBack} variant="outlined" style={{ flex: 1 }} />
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button title="Siguiente" onPress={handleNext} style={{ flex: 1 }} />
          ) : (
            <Button title="Registrarse" onPress={handleSubmit} loading={isSubmitting} style={{ flex: 1 }} />
          )}
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
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32, gap: 24 },
  stepItem: { alignItems: 'center', gap: 6 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  stepLabel: { fontSize: 12, fontFamily: 'Montserrat-SemiBold' },
  form: { gap: 4 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  link: { fontFamily: 'Montserrat-SemiBold', fontSize: 14 },
});
