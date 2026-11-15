import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

import { Colors, type ThemeColors, type ThemeMode } from '@/constants/theme';

const THEME_STORAGE_KEY = 'theme';

export type ThemePreference = ThemeMode | 'system';

interface ThemeContextValue {
  /** Preferencia elegida por el usuario. */
  mode: ThemePreference;
  /** Modo realmente aplicado (resuelve "system"). */
  colorScheme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  /** Indica si ya se leyó la preferencia persistida. */
  isReady: boolean;
  setMode: (mode: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useNativeColorScheme();
  const [mode, setModeState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (mounted && (saved === 'light' || saved === 'dark')) {
          setModeState(saved);
        }
      })
      .catch(() => {
        // Sin preferencia guardada: se mantiene el modo del sistema.
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const colorScheme: ThemeMode =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const setMode = useCallback((nextMode: ThemePreference) => {
    setModeState(nextMode);

    const persistence =
      nextMode === 'system'
        ? AsyncStorage.removeItem(THEME_STORAGE_KEY)
        : AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);

    persistence.catch(() => {
      // El cambio visual ya se aplicó; si falla el guardado se mantiene la sesión.
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colorScheme,
      isDark: colorScheme === 'dark',
      colors: Colors[colorScheme],
      isReady,
      setMode,
      toggleTheme,
    }),
    [mode, colorScheme, isReady, setMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  }

  return context;
}

/** Hook compatible con el API anterior de Expo: devuelve solo el modo aplicado. */
export function useColorScheme(): ThemeMode {
  return useTheme().colorScheme;
}
