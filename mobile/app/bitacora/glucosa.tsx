import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { DatePickerField } from '@/components/DatePicker';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const CONTEXTOS = [
  'Antes del desayuno',
  'Después del desayuno',
  'Antes del almuerzo',
  'Después del almuerzo',
  'Antes de la cena',
  'Después de la cena',
  'Antes de dormir',
  'Ejercicio',
  'Otro',
];

export default function GlucosaScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [nivel, setNivel] = useState('');
  const [contexto, setContexto] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [resultadoHb, setResultadoHb] = useState('');
  const [fechaHb, setFechaHb] = useState(new Date());

  const handleSaveGlucosa = () => {
    if (!nivel) {
      Alert.alert('Error', 'Ingresa el nivel de glucosa');
      return;
    }
    Alert.alert('Guardado', 'Lectura de glucosa registrada');
    router.back();
  };

  const handleSaveHbA1c = () => {
    if (!resultadoHb) {
      Alert.alert('Error', 'Ingresa el resultado de HbA1c');
      return;
    }
    Alert.alert('Guardado', 'HbA1c registrada');
    router.back();
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
          Registro de glucosa
        </ThemedText>

        <Card style={styles.card}>
          <FormInput
            label="Nivel de glucosa (mg/dL)"
            value={nivel}
            onChangeText={setNivel}
            placeholder="Ej: 120"
            keyboardType="numeric"
          />

          <ThemedText type="defaultSemiBold" style={styles.contextLabel}>
            Contexto
          </ThemedText>
          <View style={styles.contextGrid}>
            {CONTEXTOS.map((context) => {
              const isSelected = contexto === context;

              return (
                <TouchableOpacity
                  key={context}
                  style={[
                    styles.contextChip,
                    {
                      backgroundColor: isSelected ? colors.primary.main : 'transparent',
                      borderColor: colors.primary.main,
                    },
                  ]}
                  onPress={() => setContexto(context)}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: isSelected ? colors.primary.contrastText : colors.primary.main,
                      fontFamily: Fonts.semiBold,
                    }}
                  >
                    {context}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
          <DatePickerField label="Hora" value={hora} onChange={setHora} mode="time" />
          <Button title="Guardar glucosa" onPress={handleSaveGlucosa} style={styles.saveButton} />
        </Card>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
          <ThemedText muted style={styles.dividerText}>
            O
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
        </View>

        <ThemedText type="h6" style={styles.hba1cTitle}>
          Registrar HbA1c
        </ThemedText>
        <Card style={styles.card}>
          <FormInput
            label="Resultado HbA1c (%)"
            value={resultadoHb}
            onChangeText={setResultadoHb}
            placeholder="Ej: 6.5"
            keyboardType="numeric"
          />
          <DatePickerField label="Fecha" value={fechaHb} onChange={setFechaHb} />
          <Button title="Guardar HbA1c" onPress={handleSaveHbA1c} style={styles.saveButton} />
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  backButton: { marginBottom: 16, width: 40 },
  title: { marginBottom: 24 },
  card: { padding: 20, marginBottom: 16 },
  contextLabel: { marginBottom: 8 },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  contextChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  saveButton: { marginTop: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { marginHorizontal: 16 },
  hba1cTitle: { marginBottom: 16 },
});
