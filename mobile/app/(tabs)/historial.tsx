import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/card';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { DatePickerField } from '@/components/DatePicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MOCK_GLUCOSE = [
  { id: '1', nivel: 120, contexto: 'Antes del desayuno', fecha: '07/07/2026', hora: '08:00' },
  { id: '2', nivel: 145, contexto: 'Después del almuerzo', fecha: '06/07/2026', hora: '14:30' },
  { id: '3', nivel: 98, contexto: 'Antes de dormir', fecha: '05/07/2026', hora: '22:00' },
  { id: '4', nivel: 156, contexto: 'Después del desayuno', fecha: '04/07/2026', hora: '09:15' },
];

const MOCK_HBA1C = [
  { id: '1', resultado: 6.5, fecha: '07/07/2026' },
  { id: '2', resultado: 7.0, fecha: '01/06/2026' },
];

export default function HistorialScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'glucosa' | 'hba1c'>('glucosa');
  const [showModal, setShowModal] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontSize: 24 }}>Historial</ThemedText>
        <Button
          title="Nuevo"
          onPress={() => setShowModal(true)}
          icon={<FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 6 }} />}
          style={{ paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 }}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'glucosa' && { borderBottomColor: Colors[colorScheme].tint, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('glucosa')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'glucosa' && { color: Colors[colorScheme].tint }]}>
            Glucemia
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'hba1c' && { borderBottomColor: Colors[colorScheme].tint, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('hba1c')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'hba1c' && { color: Colors[colorScheme].tint }]}>
            HbA1c
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'glucosa' ? (
        <FlatList
          data={MOCK_GLUCOSE}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.recordCard}>
              <View style={styles.recordRow}>
                <ThemedText type="title" style={{ fontSize: 32, color: item.nivel >= 70 && item.nivel <= 180 ? '#2e7d32' : '#d32f2f' }}>
                  {item.nivel}
                </ThemedText>
                <View style={styles.recordInfo}>
                  <ThemedText type="defaultSemiBold">{item.contexto}</ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                    {item.fecha} - {item.hora}
                  </ThemedText>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>
              Sin registros de glucosa
            </ThemedText>
          }
        />
      ) : (
        <FlatList
          data={MOCK_HBA1C}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.recordCard}>
              <View style={styles.recordRow}>
                <ThemedText type="title" style={{ fontSize: 32, color: item.resultado < 7 ? '#2e7d32' : '#f57c00' }}>
                  {item.resultado}%
                </ThemedText>
                <View style={styles.recordInfo}>
                  <ThemedText type="defaultSemiBold">Hemoglobina Glicosilada</ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>{item.fecha}</ThemedText>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>
              Sin registros de HbA1c
            </ThemedText>
          }
        />
      )}

      <AddRecordModal visible={showModal} onClose={() => setShowModal(false)} type={activeTab} />
    </ThemedView>
  );
}

function AddRecordModal({ visible, onClose, type }: { visible: boolean; onClose: () => void; type: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const [nivel, setNivel] = useState('');
  const [resultado, setResultado] = useState('');
  const [contexto, setContexto] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());

  const handleSave = () => {
    Alert.alert('Guardado', 'Registro añadido correctamente');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <ThemedText type="title" style={{ fontSize: 20, marginBottom: 20 }}>
        {type === 'glucosa' ? 'Registrar glucosa' : 'Registrar HbA1c'}
      </ThemedText>
      {type === 'glucosa' ? (
        <>
          <FormInput label="Nivel de glucosa (mg/dL)" value={nivel} onChangeText={setNivel} placeholder="Ej: 120" keyboardType="numeric" />
          <FormInput label="Contexto" value={contexto} onChangeText={setContexto} placeholder="Antes del desayuno, etc." />
          <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
          <DatePickerField label="Hora" value={hora} onChange={setHora} mode="time" />
        </>
      ) : (
        <>
          <FormInput label="Resultado HbA1c (%)" value={resultado} onChangeText={setResultado} placeholder="Ej: 6.5" keyboardType="numeric" />
          <DatePickerField label="Fecha" value={fecha} onChange={setFecha} />
        </>
      )}
      <Button title="Guardar" onPress={handleSave} style={{ marginTop: 16 }} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 16, fontFamily: 'Montserrat-SemiBold' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  recordCard: { padding: 16, marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  recordInfo: { flex: 1 },
});
