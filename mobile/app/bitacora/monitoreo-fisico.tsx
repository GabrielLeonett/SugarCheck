import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { DatePickerField } from '@/components/DatePicker';
import { FormInput } from '@/components/FormInput';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { imcApi } from '@/src/apis/imc';
import { showErrorAlert, showSuccessAlert } from '@/src/stores/systemAlertStore';

interface PhysicalRecord {
  id: string;
  fecha: string;
  peso: number;
  estatura: number;
  imc: number;
  estado: string;
}

function withAlpha(hex: string, opacity: number) {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${alpha}` : hex;
}

export default function MonitoreoFisicoScreen() {
  const { t } = useTranslation(['screens', 'common']);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [records, setRecords] = useState<PhysicalRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await imcApi.getAll());
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || t('screens:physicalForm.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const latest = records[0];

  const handleSave = async () => {
    const pesoNum = Number(peso);
    const estaturaNum = Number(estatura);
    if (!Number.isFinite(pesoNum) || pesoNum <= 0 || pesoNum >= 700) {
      showErrorAlert(t('screens:physicalForm.invalidWeight'));
      return;
    }
    if (!Number.isFinite(estaturaNum) || estaturaNum <= 0 || estaturaNum >= 280) {
      showErrorAlert(t('screens:physicalForm.invalidHeight'));
      return;
    }

    setSaving(true);
    try {
      const record = await imcApi.create({
        peso: pesoNum,
        estatura: estaturaNum,
        fecha: fecha.toISOString(),
      });
      setRecords((previous) => [record, ...previous]);
      setShowModal(false);
      setPeso('');
      setEstatura('');
      showSuccessAlert(t('screens:physicalForm.saved'));
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || t('screens:physicalForm.saveError'));
    } finally {
      setSaving(false);
    }
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
          accessibilityLabel={t('common:back')}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <ThemedText type="h4" style={styles.title}>
            {t('screens:physicalForm.title')}
          </ThemedText>
          <Button
            title={t('screens:physicalForm.new')}
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

        {loading ? (
          <ThemedText muted style={styles.emptyMessage}>{t('screens:physicalForm.loading')}</ThemedText>
        ) : latest ? (
          <Card style={styles.currentCard}>
            <ThemedText type="defaultSemiBold" style={styles.currentTitle}>
              {t('screens:physicalForm.latest')}
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
        ) : (
          <ThemedText muted style={styles.emptyMessage}>{t('screens:physicalForm.noRecords')}</ThemedText>
        )}

        <ThemedText type="defaultSemiBold" style={styles.historyTitle}>
          {t('screens:history.title')}
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
          {t('screens:physicalForm.register')}
        </ThemedText>
        <FormInput
          label={t('screens:physicalForm.weight')}
          value={peso}
          onChangeText={setPeso}
          placeholder="Ej: 70"
          keyboardType="numeric"
        />
        <FormInput
          label={t('screens:physicalForm.height')}
          value={estatura}
          onChangeText={setEstatura}
          placeholder="Ej: 170"
          keyboardType="numeric"
        />
        <DatePickerField label={t('screens:physicalForm.date')} value={fecha} onChange={setFecha} />
        <Button title={t('screens:physicalForm.save')} onPress={handleSave} loading={saving} style={styles.saveButton} />
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
  emptyMessage: { textAlign: 'center', marginVertical: 20 },
  recordCard: { padding: 16, marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'center' },
  recordContent: { flex: 1 },
  recordDetail: { fontSize: 12 },
  modalTitle: { marginBottom: 20 },
  saveButton: { marginTop: 16 },
});
