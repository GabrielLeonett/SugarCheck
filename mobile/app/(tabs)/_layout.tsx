import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { QuickRecordModal } from '@/components/QuickRecordModal';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

function TabIcon({
  route,
  focused,
  color,
  size,
}: {
  route: { name: string };
  focused: boolean;
  color: string;
  size?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  const renderIcon = () => {
    switch (route.name) {
      case 'index':
        return <IconSymbol name="house.fill" size={size} color={color} />;
      case 'historial':
        return <FontAwesome name="history" size={size} color={color} />;
      case 'agent':
        return <FontAwesome name="android" size={size} color={color} />;
      case 'perfil':
        return <FontAwesome name="user-circle" size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.iconWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {renderIcon()}
    </Animated.View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showQuickRecord, setShowQuickRecord] = useState(false);
  const [activeName, setActiveName] = useState('index');

  // Mantener activeName sincronizado con la ruta actual del router
  const updateActiveName = useCallback(() => {
    const pathname = router.pathname ?? '/(tabs)';

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
    } else {
      setActiveName('index');
    }
  }, [router]);

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
          tabBarButton: HapticTab,
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
            color={activeName === 'index' ? colors.tabIconSelected : colors.tabIconDefault}
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
            color={
              activeName === 'historial' ? colors.tabIconSelected : colors.tabIconDefault
            }
            size={26}
          />
        </TouchableOpacity>

        {/* Botón plus rectangular centrado */}
        <TouchableOpacity
          style={[styles.plusBtn, { backgroundColor: colors.primary.main }]}
          onPress={() => setShowQuickRecord(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Registro rápido"
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
            color={activeName === 'agent' ? colors.tabIconSelected : colors.tabIconDefault}
            size={26}
          />
        </TouchableOpacity>

        <TouchableOpacity
          key="perfil"
          style={styles.tabBtn}
          onPress={() => {
            setActiveName('perfil');
            goTo('/(tabs)/perfil');
          }}
          activeOpacity={0.8}
        >
          <TabIcon
            route={{ name: 'perfil' }}
            focused={activeName === 'perfil'}
            color={activeName === 'perfil' ? colors.tabIconSelected : colors.tabIconDefault}
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
