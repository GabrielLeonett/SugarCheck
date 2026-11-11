import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { GLUCO_GESTURES } from '@/constants/gestures';
import { Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type {
  SystemAlertButton,
  SystemAlertOptions,
  SystemAlertType,
} from '@/src/types/systemAlert';

export type SystemAlertProps = SystemAlertOptions & {
  visible: boolean;
  onClose: () => void;
};

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

const TYPE_ICONS: Record<SystemAlertType, IconName> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'exclamation-triangle',
  error: 'times-circle',
};

export function SystemAlert({
  visible,
  onClose,
  title,
  description,
  image,
  buttons,
  type = 'info',
  dismissible = true,
}: SystemAlertProps) {
  const { colors, isDark } = useTheme();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) setLoadingIndex(null);
  }, [visible]);

  const typeColor =
    type === 'success'
      ? colors.success.main
      : type === 'warning'
        ? colors.warning.main
        : type === 'error'
          ? colors.error.main
          : colors.info.main;

  const handleRequestClose = () => {
    if (visible && dismissible && loadingIndex === null) onClose();
  };

  const handlePress = async (button: SystemAlertButton, index: number) => {
    if (loadingIndex !== null) return;

    setLoadingIndex(index);
    try {
      await button.onPress?.();
      if (button.closeOnPress !== false) onClose();
    } catch {
      // Si la acción falla, la alerta permanece abierta para reintentar.
    } finally {
      setLoadingIndex(null);
    }
  };

  const hasButtons = Boolean(buttons && buttons.length > 0);
  const isButtonRow = buttons?.length === 2;
  const alertImage = image ?? (type === 'success' ? GLUCO_GESTURES.risaTotal : undefined);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleRequestClose}
          accessible={false}
        />

        <View
          accessibilityRole="alert"
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              backgroundColor: colors.background.paper,
              borderColor: colors.border,
              boxShadow: `0px 10px 24px ${isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)'}`,
            },
          ]}
        >
          {alertImage ? (
            <Image source={alertImage} style={styles.image} resizeMode="contain" />
          ) : (
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: withAlpha(typeColor, 0.12), borderColor: typeColor },
              ]}
            >
              <FontAwesome name={TYPE_ICONS[type]} size={32} color={typeColor} />
            </View>
          )}

          <ThemedText type="h6" style={styles.title}>
            {title}
          </ThemedText>

          {description ? (
            <ThemedText type="body2" muted style={styles.description}>
              {description}
            </ThemedText>
          ) : null}

          {hasButtons ? (
            <View style={[styles.buttons, isButtonRow ? styles.buttonsRow : styles.buttonsColumn]}>
              {buttons!.map((button, index) => (
                <Button
                  key={`${button.text}-${index}`}
                  title={button.text}
                  variant={button.variant}
                  color={button.color}
                  loading={loadingIndex === index}
                  disabled={loadingIndex !== null && loadingIndex !== index}
                  onPress={() => handlePress(button, index)}
                  style={isButtonRow ? styles.rowButton : undefined}
                />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

/** Aplica transparencia a un color hexadecimal del tema. */
function withAlpha(hex: string, opacity: number) {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${alpha}` : hex;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Shape.modalRadius,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    elevation: 12,
  },
  image: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: 8,
  },
  buttons: {
    alignSelf: 'stretch',
    marginTop: 24,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonsColumn: {
    gap: 10,
  },
  rowButton: {
    flex: 1,
  },
});
