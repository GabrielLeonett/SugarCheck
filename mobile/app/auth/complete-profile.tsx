import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/src/stores/authStore';
import { preferenceApi } from '@/src/apis/preference';
import { contactEmergenceApi } from '@/src/apis/contact-emergence';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (formData.peso && formData.talla) {
        const now = new Date();
        await preferenceApi.savePreferences({
          userId: useAuthStore.getState().user?.id || '',
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
        } as any).catch(() => {});
      }

      if (formData.nombreGuardian) {
        await contactEmergenceApi.create({
          name: formData.nombreGuardian,
          parentesco: formData.parentesco || 'otro',
          telefono: formData.telefono || undefined,
        }).catch(() => {});
      }

      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Error al guardar los datos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 24 }}>
          Completa tu perfil
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', marginBottom: 24, color: isDark ? '#aaa' : '#666' }}>
          Prepara tus estadísticas y convoca a tus guardianes
        </ThemedText>

        <View style={styles.form}>
          <ThemedText style={styles.sectionTitle}>Datos de Salud</ThemedText>

          <FormInput label="Peso (kg)" value={formData.peso} onChangeText={(v) => updateField('peso', v)} placeholder="Ej: 70" keyboardType="numeric" error={errors.peso} />
          <FormInput label="Talla (cm)" value={formData.talla} onChangeText={(v) => updateField('talla', v)} placeholder="Ej: 170" keyboardType="numeric" error={errors.talla} />
          <FormInput label="Glucosa mínima (hipo)" value={formData.glucosaMin} onChangeText={(v) => updateField('glucosaMin', v)} placeholder="Ej: 70" keyboardType="numeric" />
          <FormInput label="Glucosa máxima (hiper)" value={formData.glucosaMax} onChangeText={(v) => updateField('glucosaMax', v)} placeholder="Ej: 180" keyboardType="numeric" />

          <ThemedText style={styles.sectionTitle}>Contacto de Emergencia</ThemedText>

          <FormInput label="Nombre del contacto" value={formData.nombreGuardian} onChangeText={(v) => updateField('nombreGuardian', v)} placeholder="Nombre del familiar/amigo" />
          <FormInput label="Parentesco" value={formData.parentesco} onChangeText={(v) => updateField('parentesco', v)} placeholder="madre, padre, tutor, otro" />
          <FormInput label="Teléfono (opcional)" value={formData.telefono} onChangeText={(v) => updateField('telefono', v)} placeholder="+58 412..." keyboardType="phone-pad" />
        </View>

        <View style={styles.buttons}>
          <Button title="Omitir" onPress={handleSkip} variant="outlined" style={{ flex: 1 }} />
          <Button title="Guardar" onPress={handleSubmit} loading={isSubmitting} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  form: { gap: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, fontFamily: 'Montserrat-Bold' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
