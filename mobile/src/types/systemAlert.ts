import type { ImageSourcePropType } from 'react-native';

import type { ButtonColor, ButtonVariant } from '@/components/Button';

/** Tinte e icono por defecto cuando la alerta no trae imagen. */
export type SystemAlertType = 'info' | 'success' | 'warning' | 'error';

export interface SystemAlertButton {
  text: string;
  /** Puede ser asíncrono: el botón muestra spinner mientras se resuelve. */
  onPress?: () => void | Promise<void>;
  variant?: ButtonVariant;
  color?: ButtonColor;
  /** Cierra la alerta al terminar `onPress`. Por defecto `true`. */
  closeOnPress?: boolean;
}

export interface SystemAlertOptions {
  title: string;
  description?: string;
  image?: ImageSourcePropType;
  buttons?: SystemAlertButton[];
  type?: SystemAlertType;
  /** Permite cerrar tocando fuera o con el botón atrás. Por defecto `true`. */
  dismissible?: boolean;
}
