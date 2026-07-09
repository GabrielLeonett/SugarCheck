import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { DatePickerField } from '@/components/DatePicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Card } from '@/components/card';

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
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [nivel, setNivel] = useState('');
  const [contexto, setContexto] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showHbA1c, setShowHbA1c] = useState(false);
  const [resultadoHb, setResultadoHb] = useState('');
  const [fechaHb, setFechaHb] = useState(new Date());

  const handleSaveGlucosa = () => {
    if (!nivel) {
      Alert.alert('Error', 'Ingresa el nivel de glucosa');
      return;
    }
    Alert.alert('Guardado', 'Lectura de glucosa registrada');
    router.back() as any;
  };

  const handleSaveHbA1c = () => {
    if (!resultadoHb) {
      Alert.alert('Error', 'Ingresa el resultado de HbA1c');
      return;
    }
    Alert.alert('Guardado', 'HbA1c registrada');
    router.back() as any;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back() as any} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <ThemedText type="title" style={{ marginBottom: 24 }}>Registro de glucosa</ThemedText>

        <Card style={styles.card}>
          <FormInput label="Nivel de glucosa (mg/dL)" value={nivel} onChangeText={setNivel} placeholder="Ej: 120" keyboardType="numeric" />
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>Contexto</ThemedText>
          <View style={styles.contextGrid}>
            {CONTEXTOS.map((ctx) => (
              <TouchableOpacity
                key={ctx}
                style={[
                  styles.contextChip,
                  {
                    backgroundColor: contexto === ctx ? Colors[colorScheme].tint : 'transparent',
                    borderColor: Colors[colorScheme].tint,
                  },
                ]}
                onPress={() => setContexto(ctx)}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: contexto === ctx ? '#fff' : Colors[colorScheme].tint,
                    fontFamily: 'Montserrat-SemiBold',
                  }}
                >
                  {ctx}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
          <DatePickerField label="Hora" value={hora} onChange={setHora} mode="time" />
          <Button title="Guardar glucosa" onPress={handleSaveGlucosa} style={{ marginTop: 16 }} />
        </Card>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme].tint + '40' }]} />
          <ThemedText style={{ marginHorizontal: 16, opacity: 0.6 }}>O</ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme].tint + '40' }]} />
        </View>

        <ThemedText type="title" style={{ marginBottom: 16, fontSize: 20 }}>Registrar HbA1c</ThemedText>
        <Card style={styles.card}>
          <FormInput label="Resultado HbA1c (%)" value={resultadoHb} onChangeText={setResultadoHb} placeholder="Ej: 6.5" keyboardType="numeric" />
          <DatePickerField label="Fecha" value={fechaHb} onChange={setFechaHb} />
          <Button title="Guardar HbA1c" onPress={handleSaveHbA1c} style={{ marginTop: 16 }} />
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 16, width: 40 },
  card: { padding: 20, marginBottom: 16 },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  contextChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1 },
});
