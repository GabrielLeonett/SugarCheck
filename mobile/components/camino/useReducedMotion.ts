import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Devuelve true cuando el usuario pidió reducir las animaciones del sistema. */
export function useReducedMotion(): boolean {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    let activo = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((valor) => {
        if (activo) setReducido(valor);
      })
      .catch(() => {
        // Si la plataforma no lo soporta, se mantienen las animaciones.
      });

    const suscripcion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducido);

    return () => {
      activo = false;
      suscripcion.remove();
    };
  }, []);

  return reducido;
}
