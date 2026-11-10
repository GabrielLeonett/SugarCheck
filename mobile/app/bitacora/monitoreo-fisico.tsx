import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { DatePickerField } from '@/components/DatePicker';
import { FormInput } from '@/components/FormInput';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';

interface PhysicalRecord {
  id: string;
  fecha: string;
  peso: number;
  estatura: number;
  imc: number;
  estado: string;
}

const INITIAL_RECORDS: PhysicalRecord[] = [
  { id: '1', fecha: '25/05/2026', peso: 54.2, estatura: 158, imc: 21.7, estado: 'Normal' },
  { id: '2', fecha: '12/04/2026', peso: 63.5, estatura: 158, imc: 25.4, estado: 'Sobrepeso' },
  { id: '3', fecha: '02/03/2026', peso: 65.0, estatura: 157, imc: 26.4, estado: 'Sobrepeso' },
];

function withAlpha(hex: string, opacity: number) {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${alpha}` : hex;
}

export default function MonitoreoFisicoScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [records, setRecords] = useState<PhysicalRecord[]>(INITIAL_RECORDS);
  const [showModal, setShowModal] = useState(false);
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [fecha, setFecha] = useState(new Date());

  const latest = records[0];

  const handleSave = () => {
    if (!peso || !estatura) {
      Alert.alert('Error', 'Ingresa peso y estatura');
      return;
    }

    const pesoNum = parseFloat(peso);
    const estaturaNum = parseFloat(estatura);
    const estaturaMetros = estaturaNum / 100;
    const imc = pesoNum / (estaturaMetros * estaturaMetros);

    let estado = 'Normal';
    if (imc < 18.5) estado = 'Bajo peso';
    else if (imc >= 25) estado = 'Sobrepeso';

    const newRecord: PhysicalRecord = {
      id: String(records.length + 1),
      fecha: fecha.toLocaleDateString('es-ES'),
      peso: pesoNum,
      estatura: estaturaNum,
      imc: parseFloat(imc.toFixed(1)),
      estado,
    };

    setRecords([newRecord, ...records]);
    setShowModal(false);
    setPeso('');
    setEstatura('');
    Alert.alert('Guardado', 'Medición registrada');
  };

  const getStatusColor = (estado: string) =>
    estado === 'Normal' ? colors.success.main : colors.warning.main;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <ThemedText type="h4" style={styles.title}>
            Monitoreo físico
          </ThemedText>
          <Button
            title="Nuevo"
            onPress={() => setShowModal(true)}
            icon={
              <FontAwesome
                name="plus"
                size={14}
                color={colors.primary.contrastText}
                style={styles.addIcon}
              />
            }
            fullWidth={false}
            style={styles.addButton}
          />
        </View>

        {latest && (
          <Card style={styles.currentCard}>
            <ThemedText type="defaultSemiBold" style={styles.currentTitle}>
              Última medición
            </ThemedText>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <ThemedText type="h3" style={styles.metricValue}>
                  {latest.peso}
                </ThemedText>
                <ThemedText muted style={styles.metricUnit}>
                  kg
                </ThemedText>
              </View>
              <View style={styles.metric}>
                <ThemedText type="h3" style={styles.metricValue}>
                  {latest.estatura}
                </ThemedText>
                <ThemedText muted style={styles.metricUnit}>
                  cm
                </ThemedText>
              </View>
              <View style={styles.metric}>
                <ThemedText type="h3" style={[styles.metricValue, { color: getStatusColor(latest.estado) }]}>
                  {latest.imc}
                </ThemedText>
                <ThemedText muted style={styles.metricUnit}>
                  IMC
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: withAlpha(getStatusColor(latest.estado), 0.15) },
              ]}
            >
              <ThemedText style={{ color: getStatusColor(latest.estado), fontSize: 14 }}>
                {latest.estado}
              </ThemedText>
            </View>
          </Card>
        )}

        <ThemedText type="defaultSemiBold" style={styles.historyTitle}>
          Historial
        </ThemedText>
        {records.map((record) => (
          <Card key={record.id} style={styles.recordCard}>
            <View style={styles.recordRow}>
              <View style={styles.recordContent}>
                <ThemedText type="defaultSemiBold">{record.fecha}</ThemedText>
                <ThemedText muted style={styles.recordDetail}>
                  {record.peso} kg · {record.estatura} cm · IMC {record.imc}
                </ThemedText>
              </View>
              <ThemedText style={{ color: getStatusColor(record.estado), fontSize: 12 }}>
                {record.estado}
              </ThemedText>
            </View>
          </Card>
        ))}
      </ScrollView>

      <Modal visible={showModal} onClose={() => setShowModal(false)}>
        <ThemedText type="h6" style={styles.modalTitle}>
          Registrar medición
        </ThemedText>
        <FormInput
          label="Peso (kg)"
          value={peso}
          onChangeText={setPeso}
          placeholder="Ej: 70"
          keyboardType="numeric"
        />
        <FormInput
          label="Estatura (cm)"
          value={estatura}
          onChangeText={setEstatura}
          placeholder="Ej: 170"
          keyboardType="numeric"
        />
        <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
        <Button title="Guardar" onPress={handleSave} style={styles.saveButton} />
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  backButton: { marginBottom: 16, width: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { flex: 1 },
  addButton: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
  addIcon: { marginRight: 6 },
  currentCard: { padding: 24, marginBottom: 24 },
  currentTitle: { textAlign: 'center', marginBottom: 16 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  metric: { alignItems: 'center' },
  metricValue: { fontSize: 28 },
  metricUnit: { fontSize: 12 },
  estadoBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  historyTitle: { marginBottom: 12 },
  recordCard: { padding: 16, marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'center' },
  recordContent: { flex: 1 },
  recordDetail: { fontSize: 12 },
  modalTitle: { marginBottom: 20 },
  saveButton: { marginTop: 16 },
});
