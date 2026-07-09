import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      <Text style={[styles.text, { color: Colors[colorScheme].text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
});
