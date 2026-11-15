import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { useGuestStore } from '@/src/stores/guestStore';

export default function Index() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const isGuestMode = useGuestStore((s) => s.isGuestMode);
  const guestProfile = useGuestStore((s) => s.profile);
  const pendingImport = useGuestStore((s) => s.pendingImport);

  if (isAuthLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background.default }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (user && pendingImport) {
    return <Redirect href="/auth/import-guest" />;
  }

  if (user || (isGuestMode && guestProfile)) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/start" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
