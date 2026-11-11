import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SystemAlertHost } from '@/components/SystemAlertHost';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { initializeAppLanguage } from '@/src/i18n';

SplashScreen.preventAutoHideAsync().catch(() => {
  // La pantalla de splash puede no estar disponible en web.
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutContent() {
  const { colors, isDark, isReady } = useTheme();
  const { isAuthLoading, refresh, setLoading } = useAuthStore();
  const [languageReady, setLanguageReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Light': require('../assets/fonts/Poppins_300Light.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins_400Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins_500Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins_600SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins_700Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins_800ExtraBold.ttf'),
  });

  useEffect(() => {
    const init = async () => {
      try {
        await refresh();
      } catch {
        // Sin sesión previa activa.
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [refresh, setLoading]);

  useEffect(() => {
    initializeAppLanguage()
      .catch((error) => {
        console.error('No se pudo cargar el idioma guardado:', error);
      })
      .finally(() => setLanguageReady(true));
  }, []);

  const appReady = (fontsLoaded || Boolean(fontError)) && isReady && !isAuthLoading && languageReady;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background.default }} />;
  }

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      primary: colors.primary.main,
      background: colors.background.default,
      card: colors.background.paper,
      text: colors.text.primary,
      border: colors.divider,
      notification: colors.error.main,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.default },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="camino" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bitacora/glucosa" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bitacora/insulina" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bitacora/monitoreo-fisico" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SystemAlertHost />
    </NavigationThemeProvider>
  );
}
