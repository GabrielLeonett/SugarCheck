import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Título opcional para el mensaje de error. */
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Captura errores de renderizado y muestra un mensaje legible en lugar de
 * dejar la pantalla en blanco. Útil para diagnosticar fallas en runtime.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>
              {this.props.fallbackTitle ?? 'Algo falló en esta pantalla'}
            </Text>
            <Text selectable style={styles.message}>
              {String(this.state.error.message || this.state.error)}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#333',
  },
});
