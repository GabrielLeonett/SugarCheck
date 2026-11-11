import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { DatePickerField } from '@/components/DatePicker';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { glucoseApi } from '@/src/apis/glucose';
import { hba1cApi } from '@/src/apis/hba1c';
import { showErrorAlert, showSuccessAlert } from '@/src/stores/systemAlertStore';

const CONTEXTOS = [
  { value: 'En Ayunas', key: 'fasting' },
  { value: 'Despues de comer', key: 'afterMeal' },
  { value: 'Control general', key: 'general' },
];

export default function GlucosaScreen() {
  const { t } = useTranslation(['screens', 'common']);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [nivel, setNivel] = useState('');
  const [contexto, setContexto] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [resultadoHb, setResultadoHb] = useState('');
  const [fechaHb, setFechaHb] = useState(new Date());
  const [savingGlucose, setSavingGlucose] = useState(false);
  const [savingHbA1c, setSavingHbA1c] = useState(false);

  const handleSaveGlucosa = async () => {
    const valueMgdl = Number(nivel);
    if (!Number.isFinite(valueMgdl) || valueMgdl < 1 || valueMgdl > 999) {
      showErrorAlert(t('screens:glucoseForm.invalidGlucose'));
      return;
    }
    if (!contexto) {
      showErrorAlert(t('screens:glucoseForm.contextRequired'));
      return;
    }
    setSavingGlucose(true);
    try {
      const time = `${String(hora.getHours()).padStart(2, '0')}:${String(
        hora.getMinutes()
      ).padStart(2, '0')}`;
      await glucoseApi.create({
        valueMgdl,
        mealTag: contexto,
        date: fecha.toISOString(),
        time,
      });
      showSuccessAlert(t('screens:glucoseForm.glucoseSaved'), t('common:success'), () => router.back());
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || t('screens:glucoseForm.glucoseSaveError'));
    } finally {
      setSavingGlucose(false);
    }
  };

  const handleSaveHbA1c = async () => {
    const value = Number(resultadoHb);
    if (!Number.isFinite(value) || value < 0.1 || value > 20) {
      showErrorAlert(t('screens:glucoseForm.invalidHba1c'));
      return;
    }
    setSavingHbA1c(true);
    try {
      await hba1cApi.create({ resultado: value, fecha: fechaHb.toISOString() });
      showSuccessAlert(t('screens:glucoseForm.hba1cSaved'), t('common:success'), () => router.back());
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || t('screens:glucoseForm.hba1cSaveError'));
    } finally {
      setSavingHbA1c(false);
    }
  };

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
          {t('screens:glucoseForm.title')}
        </ThemedText>

        <Card style={styles.card}>
          <FormInput
            label={t('screens:glucoseForm.level')}
            value={nivel}
            onChangeText={setNivel}
            placeholder="Ej: 120"
            keyboardType="numeric"
          />

          <ThemedText type="defaultSemiBold" style={styles.contextLabel}>
            {t('screens:glucoseForm.context')}
          </ThemedText>
          <View style={styles.contextGrid}>
            {CONTEXTOS.map((context) => {
              const isSelected = contexto === context.value;

              return (
                <TouchableOpacity
                  key={context.value}
                  style={[
                    styles.contextChip,
                    {
                      backgroundColor: isSelected ? colors.primary.main : 'transparent',
                      borderColor: colors.primary.main,
                    },
                  ]}
                  onPress={() => setContexto(context.value)}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: isSelected ? colors.primary.contrastText : colors.primary.main,
                      fontFamily: Fonts.semiBold,
                    }}
                  >
                    {t(`screens:glucoseForm.${context.key}`)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <DatePickerField label={t('screens:glucoseForm.date')} value={fecha} onChange={setFecha} />
          <DatePickerField label={t('screens:glucoseForm.time')} value={hora} onChange={setHora} mode="time" />
          <Button
            title={t('screens:glucoseForm.saveGlucose')}
            onPress={handleSaveGlucosa}
            loading={savingGlucose}
            style={styles.saveButton}
          />
        </Card>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
          <ThemedText muted style={styles.dividerText}>
            {t('screens:glucoseForm.or')}
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
        </View>

        <ThemedText type="h6" style={styles.hba1cTitle}>
          {t('screens:glucoseForm.recordHba1c')}
        </ThemedText>
        <Card style={styles.card}>
          <FormInput
            label={t('screens:glucoseForm.hba1cResult')}
            value={resultadoHb}
            onChangeText={setResultadoHb}
            placeholder="Ej: 6.5"
            keyboardType="numeric"
          />
          <DatePickerField label={t('screens:glucoseForm.date')} value={fechaHb} onChange={setFechaHb} />
          <Button
            title={t('screens:glucoseForm.saveHba1c')}
            onPress={handleSaveHbA1c}
            loading={savingHbA1c}
            style={styles.saveButton}
          />
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  backButton: { marginBottom: 16, width: 40 },
  title: { marginBottom: 24 },
  card: { padding: 20, marginBottom: 16 },
  contextLabel: { marginBottom: 8 },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  contextChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  saveButton: { marginTop: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { marginHorizontal: 16 },
  hba1cTitle: { marginBottom: 16 },
});
