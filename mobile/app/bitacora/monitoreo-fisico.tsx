import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { DatePickerField } from '@/components/DatePicker';
import { Card } from '@/components/card';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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

export default function MonitoreoFisicoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back() as any} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <ThemedText type="title" style={{ fontSize: 24 }}>Monitoreo físico</ThemedText>
          <Button
            title="Nuevo"
            onPress={() => setShowModal(true)}
            icon={<FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 6 }} />}
            style={{ paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 }}
          />
        </View>

        {latest && (
          <Card style={styles.currentCard}>
            <ThemedText type="defaultSemiBold" style={{ textAlign: 'center', marginBottom: 16 }}>Última medición</ThemedText>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <ThemedText type="title" style={{ fontSize: 28 }}>{latest.peso}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>kg</ThemedText>
              </View>
              <View style={styles.metric}>
                <ThemedText type="title" style={{ fontSize: 28 }}>{latest.estatura}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>cm</ThemedText>
              </View>
              <View style={styles.metric}>
                <ThemedText type="title" style={{ fontSize: 28, color: latest.imc >= 18.5 && latest.imc < 25 ? '#2e7d32' : '#f57c00' }}>
                  {latest.imc}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>IMC</ThemedText>
              </View>
            </View>
            <View style={[styles.estadoBadge, { backgroundColor: latest.estado === 'Normal' ? '#2e7d3220' : '#f57c0020' }]}>
              <ThemedText style={{ color: latest.estado === 'Normal' ? '#2e7d32' : '#f57c00', fontSize: 14 }}>
                {latest.estado}
              </ThemedText>
            </View>
          </Card>
        )}

        <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Historial</ThemedText>
        {records.map((record) => (
          <Card key={record.id} style={styles.recordCard}>
            <View style={styles.recordRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{record.fecha}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                  {record.peso} kg · {record.estatura} cm · IMC {record.imc}
                </ThemedText>
              </View>
              <ThemedText style={{ color: record.estado === 'Normal' ? '#2e7d32' : '#f57c00', fontSize: 12 }}>
                {record.estado}
              </ThemedText>
            </View>
          </Card>
        ))}
      </ScrollView>

      <Modal visible={showModal} onClose={() => setShowModal(false)}>
        <ThemedText type="title" style={{ fontSize: 20, marginBottom: 20 }}>Registrar medición</ThemedText>
        <FormInput label="Peso (kg)" value={peso} onChangeText={setPeso} placeholder="Ej: 70" keyboardType="numeric" />
        <FormInput label="Estatura (cm)" value={estatura} onChangeText={setEstatura} placeholder="Ej: 170" keyboardType="numeric" />
        <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
        <Button title="Guardar" onPress={handleSave} style={{ marginTop: 16 }} />
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 100 },
  backButton: { marginBottom: 16, width: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  currentCard: { padding: 24, marginBottom: 24 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  metric: { alignItems: 'center' },
  estadoBadge: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  recordCard: { padding: 16, marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'center' },
});
