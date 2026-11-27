import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Guarda el refresh token de la app móvil en almacenamiento cifrado.
 *
 * En web no se usa: allí la sesión se mantiene con la cookie httpOnly que
 * administra el navegador. `SecureStore` no existe en web, por eso el guard
 * por plataforma.
 */
const REFRESH_TOKEN_KEY = 'sugarcheck.refresh_token';

const available = Platform.OS !== 'web';

export async function getStoredRefreshToken(): Promise<string | null> {
  if (!available) return null;

  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredRefreshToken(token: string | null): Promise<void> {
  if (!available) return;

  try {
    if (token) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch {
    // Si el almacenamiento falla, la sesión sigue funcionando con la cookie.
  }
}
