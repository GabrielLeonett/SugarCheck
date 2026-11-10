import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { authApi } from '@/src/apis/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Error al enviar solicitud';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <ThemedText type="h4" style={styles.title}>
          Recuperar contraseña
        </ThemedText>

        {sent ? (
          <View style={styles.sentContainer}>
            <FontAwesome name="check-circle" size={64} color={colors.success.main} />
            <Text style={[styles.sentText, { color: colors.text.primary }]}>
              Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.
            </Text>
            <Button
              title="Volver al inicio"
              onPress={() => router.push('/auth/login')}
              style={styles.sentButton}
            />
          </View>
        ) : (
          <>
            <FormInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
            />
            <Button
              title="Enviar solicitud"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  backButton: { marginBottom: 24, width: 40 },
  title: { textAlign: 'center', marginBottom: 16 },
  sentContainer: { alignItems: 'center', marginTop: 40, gap: 16 },
  sentText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  sentButton: { marginTop: 24 },
  submitButton: { marginTop: 8 },
});
