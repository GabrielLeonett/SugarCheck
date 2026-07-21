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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Cabecera Principal */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Home</Text>
          <TouchableOpacity>
            <Menu color={Colors.light.primary.main} size={32} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Saludo */}
        <Text style={styles.greeting}>
          ¡Hola, Guerrero {user?.name || 'David'}!
        </Text>

        {/* TARJETA 1: Última Batalla y Cronómetro */}
        <Card style={styles.mainCard}>
          {/* Sección: Última Batalla */}
          <H5 style={styles.cardTitle}>Última Batalla</H5>

          <View style={styles.glucoseContainer}>
            <Text style={styles.glucoseValue}>{lastLevel}</Text>
            <View style={styles.glucoseUnitWrapper}>
              <ChevronUp color={Colors.light.success.main} size={32} strokeWidth={3} />
              <Text style={styles.glucoseUnit}>mg/dL</Text>
            </View>
          </View>

          <Text style={styles.timeSubtitle}>Hace 2 horas (Post-Desayuno)</Text>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Sección: Cronómetro de Seguridad */}
          <H5 style={[styles.cardTitle, { width: '70%' }]}>
            Cronómetro de Seguridad
          </H5>
          <Text style={styles.insulinSubtitle}>Última Insulina Rápida</Text>

          <View style={styles.timerContainer}>
            <Text style={styles.timerValue}>2:15</Text>
            <Text style={styles.timerUnit}>Horas transcurridas</Text>
          </View>

          <Text style={styles.safeZoneText}>Zona Segura</Text>
        </Card>

        {/* TARJETA 2: Misiones del Día */}
        <Card style={styles.missionCard}>
          <H5 style={styles.cardTitle}>Misiones del Día</H5>
          <Text style={styles.missionSubtitle}>Entrenamiento de Hoy</Text>

          <View style={styles.checkList}>
            <TouchableOpacity style={styles.checkItem}>
              <CheckSquare color={Colors.light.textSecondary} size={24} />
              <Text style={styles.checkText}>Desayuno</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkItem}>
              <CheckSquare color={Colors.light.textSecondary} size={24} />
              <Text style={styles.checkText}>Almuerzo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkItem}>
              <CheckSquare color={Colors.light.textSecondary} size={24} />
              <Text style={styles.checkText}>Cena</Text>
            </TouchableOpacity>
          </View>
        </Card>

      </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.background // Color de fondo general (#E4EFF7)
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100 // Espacio para el Tab Bar inferior
  },

  // Header y Saludo
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  pageTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.light.primary.main,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 20,
  },

  // Estilos de las Tarjetas
  mainCard: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#d7e7f3', // Un tono ligeramente más gris/azulado para la tarjeta según la imagen
    elevation: 0, // Quitamos la sombra para que se vea plano como en el diseño
  },
  cardTitle: {
    color: Colors.light.primary.light, // Azul claro de los títulos de tarjeta
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12
  },

  // Sección Última Batalla
  glucoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  glucoseValue: {
    fontSize: 80,
    fontWeight: '800',
    color: Colors.light.success.main,
    lineHeight: 85,
  },
  glucoseUnitWrapper: {
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 10
  },
  glucoseUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.success.main,
  },
  timeSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.success.main,
    marginBottom: 20
  },

  // Divisor
  divider: {
    height: 1,
    backgroundColor: Colors.light.icon,
    opacity: 0.3,
    marginBottom: 20
  },

  // Sección Cronómetro
  insulinSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 12
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16
  },
  timerValue: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.light.success.main,
    lineHeight: 70,
  },
  timerUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.success.main,
    marginLeft: 8
  },
  safeZoneText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.success.main,
  },

  // Tarjeta de Misiones
  missionCard: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#d7e7f3',
    elevation: 0,
  },
  missionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16
  },
  checkList: {
    gap: 16
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  checkText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.textSecondary
  }
});