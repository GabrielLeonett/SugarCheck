import React from 'react';
import {
  Keyboard,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, children }: ModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <Pressable
          style={[
            styles.content,
            {
              backgroundColor: colors.background.paper,
              paddingBottom: Math.max(insets.bottom, 24) + 16,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.divider }]} />
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: Shape.modalRadius,
    borderTopRightRadius: Shape.modalRadius,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
});
