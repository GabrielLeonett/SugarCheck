import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/src/stores/authStore';
import { useGuestStore } from '@/src/stores/guestStore';
import { showErrorAlert } from '@/src/stores/systemAlertStore';

/**
 * Punto de entrada del deep link `sugarcheck://auth/callback`.
 *
 * Normalmente `WebBrowser.openAuthSessionAsync` intercepta la redirección y
 * esta pantalla no llega a mostrarse, pero sirve como respaldo si el enlace
 * se abre directamente en la app.
 */
export default function OAuthCallbackScreen() {
  const { code, error } = useLocalSearchParams<{ code?: string; error?: string }>();
  const router = useRouter();
  const { t } = useTranslation('auth');
  const exchangeOAuthCode = useAuthStore((state) => state.exchangeOAuthCode);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const finish = async () => {
      if (error || !code) {
        showErrorAlert(t('socialLoginCancelled'));
        router.replace('/auth/login');
        return;
      }

      try {
        await exchangeOAuthCode(code);
        const isNewUser = useAuthStore.getState().isNewUser;
        useAuthStore.getState().clearNewUserFlag();

        if (useGuestStore.getState().pendingImport) {
          router.replace('/auth/import-guest');
        } else if (isNewUser) {
          router.replace('/auth/complete-profile');
        } else {
          router.replace('/(tabs)');
        }
      } catch {
        showErrorAlert(t('socialLoginError', { provider: 'Google/Facebook' }));
        router.replace('/auth/login');
      }
    };

    void finish();
  }, [code, error, exchangeOAuthCode, router, t]);

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
      <ThemedText style={styles.text}>{t('socialLoginProcessing')}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    textAlign: 'center',
  },
});
