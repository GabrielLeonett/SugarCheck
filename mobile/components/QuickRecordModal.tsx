import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickRecordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function QuickRecordModal({ visible, onClose }: QuickRecordModalProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <ThemedView style={[styles.overlay, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.backdrop}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Cerrar registro rápido"
        />

        <ThemedView variant="paper" style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <ThemedText type="h5" style={styles.title}>
            Registro rápido
          </ThemedText>

          <View style={styles.options}>
            <QuickOption
              icon="heartbeat"
              label="Registrar glucosa"
              color={colors.success.main}
              onPress={() => {
                onClose();
                router.push('/bitacora/glucosa');
              }}
            />
            <QuickOption
              icon="clock-o"
              label="Registrar insulina"
              color={colors.info.main}
              onPress={() => {
                onClose();
                router.push('/bitacora/insulina');
              }}
            />
            <QuickOption
              icon="balance-scale"
              label="Monitoreo físico"
              color={colors.warning.main}
              onPress={() => {
                onClose();
                router.push('/bitacora/monitoreo-fisico');
              }}
            />
          </View>

          <Button
            title="Cancelar"
            onPress={onClose}
            variant="text"
            style={styles.cancelButton}
          />
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

function QuickOption({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.option}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <FontAwesome name={icon as any} size={28} color={color} />
      <ThemedText type="body1" style={styles.optionLabel}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
    maxHeight: '65%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    flex: 1,
  },
  cancelButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
});
