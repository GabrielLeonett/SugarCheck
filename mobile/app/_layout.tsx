import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthLoading, refresh, setLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        await refresh();
      } catch {
      } finally {
        setLoading(false);
        await SplashScreen.hideAsync();
      }
    };
    init();
  }, []);

  if (isAuthLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="camino" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bitacora/glucosa" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bitacora/insulina" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bitacora/monitoreo-fisico" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
