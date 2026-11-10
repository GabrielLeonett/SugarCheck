import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { H1, H2, Body1, Caption, H4 } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';

const LANGUAGE_STORAGE_KEY = 'app_language';

type AppLanguage = 'es' | 'en';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const loginWithProvider = useAuthStore((s) => s.loginWithProvider);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [language, setLanguage] = useState<AppLanguage>('es');

  // Cargar idioma guardado
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'es' || saved === 'en') {
          setLanguage(saved as AppLanguage);
        }
      })
      .catch(() => {
        // Idioma por defecto: español
      });
  }, []);

  const changeLanguage = useCallback((next: AppLanguage) => {
    setLanguage(next);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next).catch(() => { });
  }, []);

  // Textos según idioma
  const t = {
    es: {
      title: 'SugarCheck',
      subtitle: 'Inicia sesión para continuar',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'correo@ejemplo.com',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: '••••••',
      loginButton: 'Iniciar sesión',
      forgotPassword: '¿Olvidaste tu contraseña?',
      or: 'O',
      googleButton: 'Continuar con Google',
      facebookButton: 'Continuar con Facebook',
      noAccount: '¿No tienes cuenta?',
      register: 'Regístrate',
    },
    en: {
      title: 'Blue Warriors',
      subtitle: 'Log in to continue',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••',
      loginButton: 'Log in',
      forgotPassword: 'Forgot your password?',
      or: 'Or',
      googleButton: 'Continue with Google',
      facebookButton: 'Continue with Facebook',
      noAccount: "Don't have an account?",
      register: 'Sign up',
    },
  }[language];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = t.emailLabel + ' es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Correo inválido';
    if (!password) errs.password = t.passwordLabel + ' es requerida';
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Error al iniciar sesión';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      await loginWithProvider(provider);
      const isNew = useAuthStore.getState().isNewUser;
      useAuthStore.getState().clearNewUserFlag();
      if (isNew) {
        router.replace('/auth/complete-profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || `Error al iniciar sesión con ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/icons/SugarCheck.svg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <H2 style={[styles.appTitle, { color: colors.primary.main }]}>
            {t.title}
          </H2>
          <ThemedText muted style={styles.subtitle}>{t.subtitle}</ThemedText>
        </View>

        {/* Tarjeta: bienvenida */}
        <Card style={styles.card}>
          <Image
            source={require('../../assets/gluco-saludo.png')}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
          <H1 style={[styles.welcomeTitle, { color: colors.primary.main }]}>
            ¡Bienvenido, Guerrero!
          </H1>
          <Body1 style={styles.welcomeBody}>
            Prepárate para la batalla de hoy. Entra a tu panel, asegura tu bienestar y mantente firme en la zona segura.
          </Body1>
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>
              {t.noAccount} {t.register}
            </ThemedText>
          </TouchableOpacity>
        </Card>

        {/* Tarjeta: formulario de acceso (fondo primary del sistema) */}
        <Card style={[styles.card, { backgroundColor: colors.primary.dark }]}>
          <H4 style={[styles.formTitle, { color: colors.text.inverse }]}>
            {t.loginButton}
          </H4>
          <ThemedText style={[styles.formSubtitle, { color: colors.text.inverse }]}>
            Ingresa tus credenciales para acceder
          </ThemedText>
          <FormInput
            label={t.emailLabel}
            value={email}
            onChangeText={setEmail}
            placeholder={t.emailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <FormInput
            label={t.passwordLabel}
            value={password}
            onChangeText={setPassword}
            placeholder={t.passwordPlaceholder}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Button
            title={t.loginButton}
            onPress={handleLogin}
            loading={loading}
            style={styles.primaryButton}
          />

          <ThemedText
            type="defaultSemiBold"
            style={[styles.dividerTitle, { color: colors.text.inverse }]}
          >
            {t.or}
          </ThemedText>
          <View style={styles.socialRow}>
            <Button
              title={t.googleButton}
              onPress={() => handleSocialLogin('google')}
              variant="outlined"
              loading={socialLoading === 'google'}
              icon={<FontAwesome name="google" size={20} color={colors.primary.main} />}
              style={styles.socialButton}
            />
            <Button
              title={t.facebookButton}
              onPress={() => handleSocialLogin('facebook')}
              variant="outlined"
              color="secondary"
              loading={socialLoading === 'facebook'}
              icon={<FontAwesome name="facebook" size={20} color={colors.info.main} />}
              style={styles.socialButton}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={[styles.linkText, { color: colors.text.inverse }]}>
              {t.forgotPassword}
            </ThemedText>
          </TouchableOpacity>
        </Card>

        {/* Pie: patrocinador */}
        <View style={styles.footer}>
          <Caption style={styles.footerText}>Patrocinado por</Caption>
          <Image
            source={require('../../assets/escudo.png')}
            style={styles.sponsorLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
  welcomeImage: {
    width: 170,
    height: 170,
    marginBottom: 16,
    alignSelf: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeBody: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 4,
  },
  formSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  dividerTitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 6,
  },
  sponsorLogo: {
    width: 120,
    height: 40,
  },
});
