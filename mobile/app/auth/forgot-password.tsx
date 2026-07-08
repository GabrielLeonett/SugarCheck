import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { authApi } from '@/src/apis/auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al enviar solicitud';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 16 }}>
          Recuperar contraseña
        </ThemedText>

        {sent ? (
          <View style={styles.sentContainer}>
            <FontAwesome name="check-circle" size={64} color={Colors[colorScheme].tint} />
            <Text style={[styles.sentText, { color: Colors[colorScheme].text }]}>
              Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.
            </Text>
            <Button title="Volver al inicio" onPress={() => router.push('/auth/login' as any)} style={{ marginTop: 24 }} />
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
            <Button title="Enviar solicitud" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  backButton: { marginBottom: 24, width: 40 },
  sentContainer: { alignItems: 'center', marginTop: 40, gap: 16 },
  sentText: { fontSize: 16, textAlign: 'center', fontFamily: 'Montserrat-Regular', lineHeight: 24 },
});
