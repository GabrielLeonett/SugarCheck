import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { syncApi } from '@/src/sync/sync.api';
import type { SyncRecord, SyncTableName, TableChanges } from '@/src/sync/sync.types';
import { userApi } from '@/src/apis/user';
import { completarNivelCamino, getCaminoProgreso } from '@/src/apis/camino';
import { useAuthStore } from '@/src/stores/authStore';
import { useGuestStore, type GuestRecord } from '@/src/stores/guestStore';
import { showErrorAlert } from '@/src/stores/systemAlertStore';

function toSyncRecord(record: GuestRecord, data: Record<string, unknown>): SyncRecord {
  return {
    id: record.id,
    data,
    createdAt: record.createdAt,
    updatedAt: record.createdAt,
  };
}

export default function ImportGuestScreen() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const profile = useGuestStore((state) => state.profile);
  const records = useGuestStore((state) => state.records);
  const setPendingImport = useGuestStore((state) => state.setPendingImport);
  const clearGuestData = useGuestStore((state) => state.clearGuestData);
  const [importing, setImporting] = useState(false);

  if (!user || !profile) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLater = async () => {
    try {
      await setPendingImport(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('No se pudo guardar la decisión de importar después:', error);
      showErrorAlert(t('auth:guestImportError'));
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const changes: Partial<Record<SyncTableName, TableChanges>> = {
        glucose: {
          created: records.glucose.map((record) => toSyncRecord(record, {
            valueMgdl: Number(record.valueMgdl),
            mealTag: String(record.mealTag),
            date: String(record.date),
            time: String(record.time),
          })),
        },
        hba1c: {
          created: records.hba1c.map((record) => toSyncRecord(record, {
            valuePercent: Number(record.valuePercent),
            examDate: String(record.examDate),
          })),
        },
        insulina: {
          created: records.insulin.map((record) => toSyncRecord(record, {
            tipo: String(record.tipo),
            dosis: Number(record.dosis),
            unidades: Number(record.unidades),
            fecha: String(record.fecha),
            hora: String(record.hora),
            zona: String(record.zona),
            contexto: record.contexto,
          })),
        },
        imc: {
          created: records.physical.map((record) => toSyncRecord(record, {
            peso: Number(record.peso),
            altura: Number(record.altura),
            fecha: String(record.fecha),
          })),
        },
        contactEmergence: {
          created: [toSyncRecord({
            id: profile.emergencyContact.id,
            createdAt: profile.createdAt,
          }, {
            name: profile.emergencyContact.name,
            parentesco: profile.emergencyContact.relationship,
            telefono: profile.emergencyContact.phone,
          })],
        },
        preference: {
          created: [{
            id: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: {
            profileImg: profile.avatar,
            unitMeasure: 'mg/dL',
            thresholds: {
              hypo: profile.glucoseRange.hypo,
              hiper: profile.glucoseRange.hyper,
            },
            insulinRatios: { breakfast: 100, lunch: 100, dinner: 100 },
            sensitivity: 1,
            },
          }],
        },
      };

      const result = await syncApi.push({ changes });
      if (result.rejected.length > 0) {
        throw new Error(result.rejected.map((item) => `${item.table}: ${item.reason}`).join('\n'));
      }

      await userApi.update(user.id, {
        name: profile.name,
        sexo: profile.sex,
        fechaNacimiento: profile.birthDate,
        goal: profile.goal,
      });
      const currentPath = await getCaminoProgreso();
      const targetLevel = useGuestStore.getState().caminoProgress;
      for (let level = currentPath.ultimoNivelCompletado + 1; level <= targetLevel; level += 1) {
        await completarNivelCamino(level);
      }
      await clearGuestData();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('No se pudieron asociar los datos del invitado:', error);
      const message = error instanceof Error ? error.message : t('auth:guestImportError');
      showErrorAlert(`${t('auth:guestImportError')} ${message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <ThemedText type="h4" style={[styles.title, { color: colors.primary.main }]}>
          {t('auth:guestImportTitle')}
        </ThemedText>
        <ThemedText muted style={styles.subtitle}>
          {t('auth:guestImportSubtitle', { name: profile.name })}
        </ThemedText>
        <Card style={styles.card}>
          <ThemedText type="defaultSemiBold">{t('auth:guestImportIncluded')}</ThemedText>
          <ThemedText muted>{t('auth:guestImportProfile')}</ThemedText>
          <ThemedText muted>{t('auth:guestImportRecords', {
            count: records.glucose.length + records.hba1c.length + records.insulin.length + records.physical.length,
          })}</ThemedText>
          <ThemedText muted style={styles.notice}>{t('auth:guestImportNotice')}</ThemedText>
        </Card>
        <Button
          title={t('auth:guestImportNow')}
          onPress={handleImport}
          loading={importing}
        />
        <View style={styles.gap} />
        <Button
          title={t('auth:guestImportLater')}
          onPress={handleLater}
          variant="outlined"
          disabled={importing}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 20 },
  card: { padding: 18, gap: 12, marginBottom: 20 },
  notice: { fontSize: 12 },
  gap: { height: 12 },
});
