import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Menu, ChevronUp, CheckSquare } from 'lucide-react-native'; // Asegúrate de tener instalada esta librería
import { Card } from '@/components/card';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/src/stores/authStore';
import { H5 } from '@/components/ui/h5';
import { H1 } from '@/components/ui/h1';
import { Colors } from '@/constants/theme';

const MOCK_GLUCOSE_DATA = [120, 145, 98, 156, 132, 110, 120];

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const lastLevel = MOCK_GLUCOSE_DATA[MOCK_GLUCOSE_DATA.length - 1];

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