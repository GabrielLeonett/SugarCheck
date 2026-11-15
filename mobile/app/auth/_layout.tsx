import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.default },
      }}
    >
      <Stack.Screen name="start" />
      <Stack.Screen name="guest-onboarding" />
      <Stack.Screen name="import-guest" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="complete-profile" />
    </Stack>
  );
}
