import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';

export default function Index() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  if (isAuthLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background.default }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/auth/login'} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
