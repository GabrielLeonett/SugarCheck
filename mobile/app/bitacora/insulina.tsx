import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/card';
import { Button } from '@/components/Button';
import { DatePickerField } from '@/components/DatePicker';
import { ZoneSelector } from '@/components/ZoneSelector';
import { insulinaApi } from '@/src/apis/insulina';
import { CONTEXTOS_INSULINA } from '@/src/types';
import type { DailyInsulinTotals } from '@/src/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TIEMPO_SEGURIDAD = 3 * 60 * 60;

export default function InsulinaScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const colors = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<'RAPIDA' | 'LENTA'>('RAPIDA');
  const [dosis, setDosis] = useState('');
  const [contexto, setContexto] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [zona, setZona] = useState('ABDOMEN_IZQUIERDO');
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<DailyInsulinTotals>({
    totalRapida: 0,
    totalLenta: 0,
    totalGeneral: 0,
  });
  const [ultimaRapida, setUltimaRapida] = useState<Date | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const loadTotals = useCallback(async () => {
    try {
      const data = await insulinaApi.getTotals();
      setTotals(data);
    } catch { console.error('Error al cargar totales'); }
  }, []);

  const loadUltimaDosisRapida = useCallback(async () => {
    try {
      const records = await insulinaApi.getAll({ tipo: 'RAPIDA' });
      if (records.length > 0) {
        setUltimaRapida(new Date(records[0].createdAt));
      }
    } catch { console.error('Error al cargar última dosis'); }
  }, []);

  useEffect(() => {
    loadTotals();
    loadUltimaDosisRapida();
  }, [loadTotals, loadUltimaDosisRapida]);

  useEffect(() => {
    if (!ultimaRapida) return;
    const calcular = () => {
      const ahora = new Date();
      const diff = (ahora.getTime() - ultimaRapida.getTime()) / 1000;
      setSegundosRestantes(Math.max(0, TIEMPO_SEGURIDAD - diff));
    };
    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [ultimaRapida]);

  const formatTimer = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = Math.floor(segundos % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const safetyStatus = () => {
    if (!ultimaRapida) return { color: '#999', label: 'Sin registro', icon: 'clock-o' as const };
    if (segundosRestantes <= 0) return { color: '#22c55e', label: 'Zona segura', icon: 'check-circle' as const };
    if (segundosRestantes < 1800) return { color: '#f59e0b', label: 'Próximo a vencer', icon: 'exclamation-triangle' as const };
    return { color: '#ef4444', label: 'Espera...', icon: 'hourglass' as const };
  };

  const handleSave = async () => {
    if (!dosis || parseFloat(dosis) <= 0) {
      Alert.alert('Error', 'Ingresa una dosis válida');
      return;
    }
    if (activeTab === 'RAPIDA' && !contexto) {
      Alert.alert('Error', 'Selecciona un contexto para la insulina rápida');
      return;
    }

    setLoading(true);
    try {
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();
      const horaStr = `${hora.getHours().toString().padStart(2, '0')}:${hora.getMinutes().toString().padStart(2, '0')}`;

      await insulinaApi.create({
        tipo: activeTab,
        dosis: parseFloat(dosis),
        dia,
        mes,
        anio,
        hora: horaStr,
        zona,
        contexto: activeTab === 'RAPIDA' ? contexto : undefined,
      });

      if (activeTab === 'RAPIDA') {
        setUltimaRapida(new Date());
        setSegundosRestantes(TIEMPO_SEGURIDAD);
      }

      Alert.alert('Guardado', `Insulina ${activeTab === 'RAPIDA' ? 'rápida' : 'lenta'} registrada`, [
        { text: 'OK', onPress: () => router.back() as any },
      ]);
      await loadTotals();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al guardar';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const safety = safetyStatus();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back() as any} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <ThemedText type="title" style={{ marginBottom: 20 }}>
          Insulina
        </ThemedText>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'RAPIDA' && { backgroundColor: colors.tint }]}
            onPress={() => { setActiveTab('RAPIDA'); setContexto(''); }}
          >
            <FontAwesome name="bolt" size={14} color={activeTab === 'RAPIDA' ? '#fff' : colors.text.primary} />
            <Text style={[styles.tabText, { color: activeTab === 'RAPIDA' ? '#fff' : colors.text.primary }]}>
              Rápida
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'LENTA' && { backgroundColor: colors.tint }]}
            onPress={() => setActiveTab('LENTA')}
          >
            <FontAwesome name="clock-o" size={14} color={activeTab === 'LENTA' ? '#fff' : colors.text.primary} />
            <Text style={[styles.tabText, { color: activeTab === 'LENTA' ? '#fff' : colors.text.primary }]}>
              Lenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <Card style={styles.card}>
          <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Dosis (UI)</Text>
          <View style={styles.dosisRow}>
            <TouchableOpacity
              style={[styles.dosisBtn, { backgroundColor: colors.background.default }]}
              onPress={() => {
                const val = parseFloat(dosis || '0');
                setDosis(Math.max(0, val - 1).toString());
              }}
            >
              <FontAwesome name="minus" size={16} color={colors.text.primary} />
            </TouchableOpacity>
            <TextInput
              style={[styles.dosisInput, { backgroundColor: colors.background.default, color: colors.text.primary }]}
              value={dosis}
              onChangeText={setDosis}
              placeholder="0"
              placeholderTextColor={colors.text.disabled}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity
              style={[styles.dosisBtn, { backgroundColor: colors.background.default }]}
              onPress={() => {
                const val = parseFloat(dosis || '0');
                setDosis((val + 1).toString());
              }}
            >
              <FontAwesome name="plus" size={16} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {activeTab === 'RAPIDA' && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Contexto</Text>
              <View style={styles.contextGrid}>
                {CONTEXTOS_INSULINA.map((ctx) => (
                  <TouchableOpacity
                    key={ctx.key}
                    style={[
                      styles.contextChip,
                      {
                        backgroundColor: contexto === ctx.key ? colors.tint : 'transparent',
                        borderColor: colors.tint,
                      },
                    ]}
                    onPress={() => setContexto(ctx.key)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: contexto === ctx.key ? '#fff' : colors.tint,
                        fontFamily: 'Montserrat-SemiBold',
                      }}
                    >
                      {ctx.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
          <DatePickerField label="Hora" value={hora} onChange={setHora} mode="time" />

          <ZoneSelector selectedZone={zona} onSelectZone={setZona} />

          <Button title={loading ? 'Guardando...' : 'Guardar'} onPress={handleSave} loading={loading} disabled={loading} />
        </Card>

        {/* Timer de seguridad */}
        <Card style={[styles.timerCard, { borderColor: safety.color }]}>
          <FontAwesome name={safety.icon} size={28} color={safety.color} />
          <ThemedText style={{ marginTop: 8, fontWeight: '600' }}>Cronómetro de seguridad</ThemedText>
          {segundosRestantes > 0 ? (
            <>
              <Text style={[styles.timerValue, { color: safety.color }]}>
                {formatTimer(segundosRestantes)}
              </Text>
              <Text style={[styles.timerStatus, { color: safety.color }]}>{safety.label}</Text>
            </>
          ) : (
            <Text style={[styles.timerValue, { color: safety.color }]}>{safety.label}</Text>
          )}
          <ThemedText style={{ fontSize: 11, opacity: 0.5, textAlign: 'center', marginTop: 8 }}>
            Tiempo recomendado entre dosis rápidas: 3 horas
          </ThemedText>
        </Card>

        {/* Totales del día */}
        <Card style={styles.card}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 16 }}>Totales del día</ThemedText>
          <View style={styles.totalsRow}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: '#4FC3F7' }]}>{totals.totalRapida.toFixed(1)}</Text>
              <ThemedText style={{ fontSize: 12 }}>Rápida</ThemedText>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: '#FFA726' }]}>{totals.totalLenta.toFixed(1)}</Text>
              <ThemedText style={{ fontSize: 12 }}>Lenta</ThemedText>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.tint }]}>{totals.totalGeneral.toFixed(1)}</Text>
              <ThemedText style={{ fontSize: 12 }}>Total</ThemedText>
            </View>
          </View>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 16, width: 40 },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  card: { padding: 20, marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, fontFamily: 'Montserrat-SemiBold' },
  dosisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dosisBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dosisInput: {
    width: 120,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contextChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  timerCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  timerValue: { fontSize: 40, fontWeight: 'bold', marginTop: 8, fontFamily: 'Montserrat-Bold' },
  timerStatus: { fontSize: 14, marginTop: 4, fontFamily: 'Montserrat-SemiBold' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  totalItem: { alignItems: 'center' },
  totalValue: { fontSize: 28, fontWeight: 'bold', fontFamily: 'Montserrat-Bold' },
});
