import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GLUCO_GESTURES } from '@/constants/gestures';
import { useTheme } from '@/contexts/ThemeContext';
import { useGuestStore } from '@/src/stores/guestStore';
import { showErrorAlert } from '@/src/stores/systemAlertStore';

export default function StartScreen() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const guestProfile = useGuestStore((state) => state.profile);
  const setGuestMode = useGuestStore((state) => state.setGuestMode);

  const continueAsGuest = async () => {
    if (!guestProfile) {
      router.push('/auth/guest-onboarding');
      return;
    }

    try {
      await setGuestMode(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('No se pudo reanudar el perfil invitado:', error);
      showErrorAlert(t('auth:guestSaveError'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <Image
          source={GLUCO_GESTURES.saludoAlegre}
          style={styles.mascot}
          resizeMode="contain"
        />
        <ThemedText type="h4" style={[styles.title, { color: colors.primary.main }]}>
          {t('auth:guestStartTitle')}
        </ThemedText>
        <ThemedText muted style={styles.subtitle}>
          {t('auth:guestStartSubtitle')}
        </ThemedText>
        <Card style={styles.card}>
          <Button
            title={guestProfile ? t('auth:guestResume', { name: guestProfile.name }) : t('auth:continueGuest')}
            onPress={continueAsGuest}
          />
          <View style={styles.gap} />
          <Button
            title={t('auth:login')}
            variant="outlined"
            onPress={() => router.push('/auth/login')}
          />
          <View style={styles.gap} />
          <Button
            title={t('auth:register')}
            variant="outlined"
            color="secondary"
            onPress={() => router.push('/auth/register')}
          />
        </Card>
        <ThemedText muted style={styles.notice}>
          {t('auth:guestPrivacy')}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  mascot: { width: 180, height: 180, alignSelf: 'center', marginBottom: 16 },
  title: { textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  card: { padding: 20 },
  gap: { height: 12 },
  notice: { textAlign: 'center', marginTop: 20, fontSize: 12 },
});
