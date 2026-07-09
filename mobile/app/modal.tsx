import { Link, Stack } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Acciones rápidas', headerShown: true }} />
      <ThemedText type="title" style={{ marginBottom: 24 }}>Acciones rápidas</ThemedText>

      <Link href={'/bitacora/glucosa' as any} asChild>
        <TouchableOpacity style={[styles.actionItem, { borderColor: Colors[colorScheme].tint }]}>
          <FontAwesome name="heartbeat" size={24} color={Colors[colorScheme].tint} />
          <ThemedText type="defaultSemiBold" style={{ marginLeft: 16 }}>Registrar glucosa</ThemedText>
        </TouchableOpacity>
      </Link>

      <Link href={'/bitacora/insulina' as any} asChild>
        <TouchableOpacity style={[styles.actionItem, { borderColor: Colors[colorScheme].tint }]}>
          <FontAwesome name="clock-o" size={24} color={Colors[colorScheme].tint} />
          <ThemedText type="defaultSemiBold" style={{ marginLeft: 16 }}>Registrar insulina</ThemedText>
        </TouchableOpacity>
      </Link>

      <Link href={'/bitacora/monitoreo-fisico' as any} asChild>
        <TouchableOpacity style={[styles.actionItem, { borderColor: Colors[colorScheme].tint }]}>
          <FontAwesome name="balance-scale" size={24} color={Colors[colorScheme].tint} />
          <ThemedText type="defaultSemiBold" style={{ marginLeft: 16 }}>Monitoreo físico</ThemedText>
        </TouchableOpacity>
      </Link>

      <Link href={'/camino' as any} asChild>
        <TouchableOpacity style={[styles.actionItem, { borderColor: Colors[colorScheme].tint }]}>
          <FontAwesome name="road" size={24} color={Colors[colorScheme].tint} />
          <ThemedText type="defaultSemiBold" style={{ marginLeft: 16 }}>Camino del Guerrero</ThemedText>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderRadius: 12,
  },
});
