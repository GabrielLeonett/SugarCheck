import { Link, Stack } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const ACTIONS = [
  { href: '/bitacora/glucosa', icon: 'heartbeat', label: 'Registrar glucosa' },
  { href: '/bitacora/insulina', icon: 'clock-o', label: 'Registrar insulina' },
  { href: '/bitacora/monitoreo-fisico', icon: 'balance-scale', label: 'Monitoreo físico' },
  { href: '/camino', icon: 'road', label: 'Camino del Guerrero' },
] as const;

export default function ModalScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h4" style={styles.title}>
          Acciones rápidas
        </ThemedText>

        {ACTIONS.map((action) => (
          <Link key={action.href} href={action.href as any} asChild>
            <TouchableOpacity
              style={[styles.actionItem, { borderColor: colors.primary.main }]}
              activeOpacity={0.8}
            >
              <FontAwesome name={action.icon as any} size={24} color={colors.primary.main} />
              <ThemedText type="defaultSemiBold" style={styles.actionLabel}>
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  actionLabel: {
    marginLeft: 16,
    fontFamily: Fonts.semiBold,
  },
});
