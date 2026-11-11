import React from 'react';

import { SystemAlert } from '@/components/SystemAlert';
import { useSystemAlertStore } from '@/src/stores/systemAlertStore';

/**
 * Monta la alerta global una sola vez en el layout raíz para que cualquier
 * pantalla pueda lanzarla desde `@/src/stores/systemAlertStore`.
 */
export function SystemAlertHost() {
  const current = useSystemAlertStore((state) => state.current);
  const hide = useSystemAlertStore((state) => state.hide);

  if (!current) return null;

  const { id, ...options } = current;

  return <SystemAlert key={id} visible {...options} onClose={() => hide(id)} />;
}
