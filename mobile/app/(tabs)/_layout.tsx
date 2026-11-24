import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { QuickRecordModal } from '@/components/QuickRecordModal';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const GLUCO_SILHOUETTE = require('../../assets/gluco-saludo.png');

const TAB_ICONS: Record<string, 'home' | 'book' | 'flag'> = {
  index: 'home',
  historial: 'book',
  camino: 'flag',
};

function TabIcon({
  route,
  focused,
  size,
}: {
  route: { name: string };
  focused: boolean;
  size?: number;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  const iconName = TAB_ICONS[route.name];
  const isAgent = route.name === 'agent';
  if (!iconName && !isAgent) return null;

  const iconColor = focused ? colors.tabIconSelected : colors.tabIconDefault;

  return (
    <Animated.View
      style={[
        styles.iconWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {isAgent ? (
        <Image
          source={GLUCO_SILHOUETTE}
          style={{
            width: (size ?? 26) + 6,
            height: (size ?? 26) + 6,
            tintColor: iconColor,
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : iconName ? (
        <FontAwesome
          name={iconName}
          size={size ?? 26}
          color={iconColor}
        />
      ) : null}
    </Animated.View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation('common');
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showQuickRecord, setShowQuickRecord] = useState(false);
  const [activeName, setActiveName] = useState('index');

  // Mantener activeName sincronizado con la ruta actual del router
  const updateActiveName = useCallback(() => {
    // Quitar el prefijo del grupo de rutas "(tabs)" y barras sobrantes
    // para que funcione tanto "/(tabs)/historial" como "/historial"
    const clean = pathname.replace(/^\/\(tabs\)\/?/, '').replace(/\/+$/, '') || 'index';

    if (clean === '' || clean === 'index') {
      setActiveName('index');
    } else if (clean === 'historial') {
      setActiveName('historial');
    } else if (clean === 'agent') {
      setActiveName('agent');
    } else if (clean === 'perfil') {
      setActiveName('perfil');
    } else if (clean === 'camino') {
      setActiveName('camino');
    } else {
      setActiveName('index');
    }
  }, [pathname]);

  useEffect(() => {
    updateActiveName();

    const unsubscribe = (router as any).addListener?.('state', () => {
      updateActiveName();
    });

    return () => {
      unsubscribe?.();
    };
  }, [router, updateActiveName]);

  const goTo = useCallback(
    (href: string) => {
      (router as any).push(href);
    },
    [router]
  );

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // expo-router 58 trae su propia copia de los tipos de react-navigation,
          // por eso BottomTabBarButtonProps no coincide entre ambos paquetes.
          tabBarButton: HapticTab as any,
          tabBarStyle: {
            display: 'none',
            height: 0,
          },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="historial" />
        <Tabs.Screen name="agent" />
        <Tabs.Screen name="perfil" />
      </Tabs>

      {/* Tab bar personalizada con elementos justificados uniformemente */}
      <View
        style={[
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, 8), borderTopColor: colors.divider },
        ]}
      >
        <TouchableOpacity
          key="index"
          style={styles.tabBtn}
          onPress={() => {
            setActiveName('index');
            goTo('/(tabs)');
          }}
          activeOpacity={0.8}
        >
          <TabIcon
            route={{ name: 'index' }}
            focused={activeName === 'index'}
            size={26}
          />
        </TouchableOpacity>

        <TouchableOpacity
          key="historial"
          style={styles.tabBtn}
          onPress={() => {
            setActiveName('historial');
            goTo('/(tabs)/historial');
          }}
          activeOpacity={0.8}
        >
          <TabIcon
            route={{ name: 'historial' }}
            focused={activeName === 'historial'}
            size={26}
          />
        </TouchableOpacity>

        {/* Botón plus rectangular centrado */}
        <TouchableOpacity
          style={[styles.plusBtn, { backgroundColor: colors.primary.main }]}
          onPress={() => setShowQuickRecord(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('quickRecord')}
        >
          <FontAwesome name="plus" size={22} color={colors.primary.contrastText} />
        </TouchableOpacity>

        <TouchableOpacity
          key="agent"
          style={styles.tabBtn}
          onPress={() => {
            setActiveName('agent');
            goTo('/(tabs)/agent');
          }}
          activeOpacity={0.8}
        >
          <TabIcon
            route={{ name: 'agent' }}
            focused={activeName === 'agent'}
            size={26}
          />
        </TouchableOpacity>

        <TouchableOpacity
          key="camino"
          style={styles.tabBtn}
          onPress={() => {
            setActiveName('camino');
            goTo('/camino');
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('warriorPath')}
        >
          <TabIcon
            route={{ name: 'camino' }}
            focused={activeName === 'camino'}
            size={26}
          />
        </TouchableOpacity>
      </View>

      <QuickRecordModal visible={showQuickRecord} onClose={() => setShowQuickRecord(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  iconWrapper: {
    marginBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtn: {
    width: 64,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
});
