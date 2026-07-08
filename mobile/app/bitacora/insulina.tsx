import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { DatePickerField } from '@/components/DatePicker';
import { Card } from '@/components/card';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function InsulinaScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [timer, setTimer] = useState(225);
  const [timerActive, setTimerActive] = useState(false);
  const [dosis, setDosis] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRegister = (tipo: 'rapida' | 'lenta') => {
    if (!dosis) {
      Alert.alert('Error', 'Ingresa la dosis');
      return;
    }
    Alert.alert('Guardado', `Dosis ${tipo} de ${dosis} unidades registrada`);
    if (tipo === 'rapida') {
      setTimer(225);
      setTimerActive(true);
    }
    setDosis('');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back() as any} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <ThemedText type="title" style={{ marginBottom: 24 }}>Registro de insulina</ThemedText>

        <Card style={styles.card}>
          <FormInput label="Dosis (unidades)" value={dosis} onChangeText={setDosis} placeholder="Ej: 10" keyboardType="numeric" />
          <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
          <DatePickerField label="Hora" value={hora} onChange={setHora} mode="time" />
          <View style={styles.buttonRow}>
            <Button title="Dosis Rápida" onPress={() => handleRegister('rapida')} style={{ flex: 1 }} />
            <View style={{ width: 8 }} />
            <Button title="Dosis Lenta" onPress={() => handleRegister('lenta')} variant="outlined" style={{ flex: 1 }} />
          </View>
        </Card>

        <Card style={[styles.timerCard, { borderColor: timerActive ? Colors[colorScheme].tint : '#999' }]}>
          <FontAwesome name="clock-o" size={32} color={timerActive ? Colors[colorScheme].tint : '#999'} />
          <ThemedText type="title" style={{ fontSize: 48, marginTop: 12 }}>
            {formatTime(timer)}
          </ThemedText>
          <ThemedText style={{ opacity: 0.6, marginTop: 4 }}>Cronómetro de seguridad</ThemedText>
          <ThemedText style={{ fontSize: 12, opacity: 0.5, textAlign: 'center', marginTop: 8 }}>
            Tiempo restante desde la última dosis rápida. Espera al menos 3 horas entre aplicaciones.
          </ThemedText>
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
  buttonRow: { flexDirection: 'row', marginTop: 8 },
  timerCard: { padding: 32, alignItems: 'center', marginBottom: 16, borderWidth: 2 },
});
