import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { DatePickerField } from '@/components/DatePicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ZoneSelector } from '@/components/ZoneSelector';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { insulinaApi } from '@/src/apis/insulina';
import { showErrorAlert, showSuccessAlert } from '@/src/stores/systemAlertStore';
import { CONTEXTOS_INSULINA } from '@/src/types';
import type { DailyInsulinTotals } from '@/src/types';

const TIEMPO_SEGURIDAD = 3 * 60 * 60;

export default function InsulinaScreen() {
  const { t } = useTranslation(['screens', 'common']);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
    } catch {
      console.error('Error al cargar totales');
    }
  }, []);

  const loadUltimaDosisRapida = useCallback(async () => {
    try {
      const records = await insulinaApi.getAll({ tipo: 'RAPIDA' });
      if (records.length > 0) {
        setUltimaRapida(new Date(records[0].createdAt));
      }
    } catch {
      console.error('Error al cargar última dosis');
    }
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
    const hours = Math.floor(segundos / 3600);
    const minutes = Math.floor((segundos % 3600) / 60);
    const seconds = Math.floor(segundos % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const safetyStatus = () => {
    if (!ultimaRapida) {
      return { color: colors.text.disabled, label: t('screens:insulinForm.noRecord'), icon: 'clock-o' as const };
    }
    if (segundosRestantes <= 0) {
      return { color: colors.success.main, label: t('screens:insulinForm.safeZone'), icon: 'check-circle' as const };
    }
    if (segundosRestantes < 1800) {
      return {
        color: colors.warning.main,
        label: t('screens:insulinForm.expiresSoon'),
        icon: 'exclamation-triangle' as const,
      };
    }
    return { color: colors.error.main, label: t('screens:insulinForm.wait'), icon: 'hourglass' as const };
  };

  const handleSave = async () => {
    if (!dosis || parseFloat(dosis) <= 0) {
      showErrorAlert(t('screens:insulinForm.invalidDose'));
      return;
    }
    if (activeTab === 'RAPIDA' && !contexto) {
      showErrorAlert(t('screens:insulinForm.contextRequired'));
      return;
    }

    setLoading(true);
    try {
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();
      const horaStr = `${hora.getHours().toString().padStart(2, '0')}:${hora
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

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

      showSuccessAlert(
        t(activeTab === 'RAPIDA' ? 'screens:insulinForm.savedRapid' : 'screens:insulinForm.savedSlow'),
        t('common:success'),
        () => router.back()
      );
      await loadTotals();
    } catch (error: any) {
      const message = error?.response?.data?.message || t('screens:insulinForm.saveError');
      showErrorAlert(message);
    } finally {
      setLoading(false);
    }
  };

  const safety = safetyStatus();

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
          accessibilityLabel={t('common:back')}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <ThemedText type="h4" style={styles.title}>
          {t('screens:insulinForm.title')}
        </ThemedText>

        <View style={[styles.tabRow, { backgroundColor: colors.background.paper }]}>
          {(['RAPIDA', 'LENTA'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'RAPIDA'
              ? t('screens:insulinForm.rapid')
              : t('screens:insulinForm.slow');
            const icon = tab === 'RAPIDA' ? 'bolt' : 'clock-o';

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && { backgroundColor: colors.primary.main }]}
                onPress={() => {
                  setActiveTab(tab);
                  if (tab === 'RAPIDA') setContexto('');
                }}
                activeOpacity={0.8}
              >
                <FontAwesome
                  name={icon}
                  size={14}
                  color={isActive ? colors.primary.contrastText : colors.text.primary}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? colors.primary.contrastText : colors.text.primary,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Card style={styles.card}>
          <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>
            {t('screens:insulinForm.dose')}
          </Text>
          <View style={styles.dosisRow}>
            <TouchableOpacity
              style={[styles.dosisBtn, { backgroundColor: colors.inputBackground }]}
              onPress={() => {
                const value = parseFloat(dosis || '0');
                setDosis(Math.max(0, value - 1).toString());
              }}
              activeOpacity={0.8}
            >
              <FontAwesome name="minus" size={16} color={colors.text.primary} />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.dosisInput,
                { backgroundColor: colors.inputBackground, color: colors.text.primary },
              ]}
              value={dosis}
              onChangeText={setDosis}
              placeholder="0"
              placeholderTextColor={colors.text.disabled}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity
              style={[styles.dosisBtn, { backgroundColor: colors.inputBackground }]}
              onPress={() => {
                const value = parseFloat(dosis || '0');
                setDosis((value + 1).toString());
              }}
              activeOpacity={0.8}
            >
              <FontAwesome name="plus" size={16} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {activeTab === 'RAPIDA' && (
            <View style={styles.contextContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>
                {t('screens:insulinForm.context')}
              </Text>
              <View style={styles.contextGrid}>
                {CONTEXTOS_INSULINA.map((context) => {
                  const isSelected = contexto === context.key;

                  return (
                    <TouchableOpacity
                      key={context.key}
                      style={[
                        styles.contextChip,
                        {
                          backgroundColor: isSelected ? colors.primary.main : 'transparent',
                          borderColor: colors.primary.main,
                        },
                      ]}
                      onPress={() => setContexto(context.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: isSelected ? colors.primary.contrastText : colors.primary.main,
                          fontFamily: Fonts.semiBold,
                        }}
                      >
                        {t(`common:${context.key === 'DESAYUNO' ? 'breakfast' : context.key === 'ALMUERZO' ? 'lunch' : context.key === 'CENA' ? 'dinner' : 'correction'}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <DatePickerField label={t('screens:insulinForm.date')} value={fecha} onChange={setFecha} />
          <DatePickerField label={t('screens:insulinForm.time')} value={hora} onChange={setHora} mode="time" />

          <ZoneSelector selectedZone={zona} onSelectZone={setZona} />

          <Button
            title={loading ? t('screens:insulinForm.saving') : t('screens:insulinForm.save')}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        </Card>

        <Card style={[styles.timerCard, { borderColor: safety.color }]}>
          <FontAwesome name={safety.icon} size={28} color={safety.color} />
          <ThemedText style={styles.timerTitle}>{t('screens:insulinForm.safetyTimer')}</ThemedText>
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
          <ThemedText muted style={styles.timerHint}>
            {t('screens:insulinForm.recommendedWait')}
          </ThemedText>
        </Card>

        <Card style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.totalsTitle}>
            {t('screens:insulinForm.dailyTotals')}
          </ThemedText>
          <View style={styles.totalsRow}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.info.main }]}>
                {totals.totalRapida.toFixed(1)}
              </Text>
              <ThemedText style={styles.totalLabel}>{t('screens:insulinForm.rapid')}</ThemedText>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.warning.main }]}>
                {totals.totalLenta.toFixed(1)}
              </Text>
              <ThemedText style={styles.totalLabel}>{t('screens:insulinForm.slow')}</ThemedText>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.primary.main }]}>
                {totals.totalGeneral.toFixed(1)}
              </Text>
              <ThemedText style={styles.totalLabel}>{t('screens:insulinForm.total')}</ThemedText>
            </View>
          </View>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  backButton: { marginBottom: 16, width: 40 },
  title: { marginBottom: 20 },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
    elevation: 2,
    boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
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
  tabText: { fontSize: 14, fontFamily: Fonts.semiBold },
  card: { padding: 20, marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: Fonts.semiBold,
  },
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
    fontFamily: Fonts.bold,
  },
  contextContainer: { marginBottom: 16 },
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
  timerTitle: { marginTop: 8, fontFamily: Fonts.semiBold },
  timerValue: { fontSize: 40, fontFamily: Fonts.bold, marginTop: 8 },
  timerStatus: { fontSize: 14, marginTop: 4, fontFamily: Fonts.semiBold },
  timerHint: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  totalsTitle: { marginBottom: 16 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  totalItem: { alignItems: 'center' },
  totalValue: { fontSize: 28, fontFamily: Fonts.bold },
  totalLabel: { fontSize: 12 },
});
