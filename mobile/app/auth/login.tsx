import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/src/stores/authStore';
import { ThemedView } from '@/components/themed-view';
import { H2 } from '@/components/ui/h2';
import { Body1 } from '@/components/ui/body1';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const loginWithProvider = useAuthStore((s) => s.loginWithProvider);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Correo electrónico es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Correo inválido';
    if (!password) errs.password = 'Contraseña es requerida';
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al iniciar sesión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      await loginWithProvider(provider);
    } catch (err: any) {
      Alert.alert('Error', err?.message || `Error al iniciar sesión con ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <H2 style={{ color: Colors[colorScheme].tint, textAlign: 'center' }}>
            Guerreros Azules
          </H2>
          <Body1 style={{ textAlign: 'center', marginTop: 8, color: isDark ? '#aaa' : '#666' }}>
            Inicia sesión para continuar
          </Body1>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <FormInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password' as any)} style={styles.linkContainer}>
            <Text style={[styles.link, { color: Colors[colorScheme].tint }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
            <Text style={[styles.dividerText, { color: isDark ? '#888' : '#999' }]}>O</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
          </View>

          <Button
            title="Continuar con Google"
            onPress={() => handleSocialLogin('google')}
            variant="outlined"
            loading={socialLoading === 'google'}
            icon={<FontAwesome name="google" size={20} color={isDark ? '#fff' : '#000'} />}
          />
          <View style={{ height: 12 }} />
          <Button
            title="Continuar con Facebook"
            onPress={() => handleSocialLogin('facebook')}
            variant="outlined"
            color="secondary"
            loading={socialLoading === 'facebook'}
            icon={<FontAwesome name="facebook" size={20} color="#1877F2" />}
          />

          <View style={styles.footer}>
            <Text style={{ color: isDark ? '#aaa' : '#666', fontFamily: 'Montserrat-Regular' }}>
              ¿No tienes cuenta?
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
              <Text style={[styles.link, { color: Colors[colorScheme].tint, marginLeft: 4 }]}>
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 4,
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  link: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});
