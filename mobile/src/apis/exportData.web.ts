import i18n from '@/src/i18n';
import { useAuthStore } from '@/src/stores/authStore';
import { BASE_URL } from './axios';

export type MedicalExportFormat = 'pdf' | 'csv';

export interface MedicalExportFilters {
  /** Fecha inicial en formato `YYYY-MM-DD` (opcional). */
  from?: string;
  /** Fecha final en formato `YYYY-MM-DD` (opcional). */
  to?: string;
}

function formatStamp(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildFilename(
  format: MedicalExportFormat,
  filters: MedicalExportFilters,
): string {
  const range =
    filters.from || filters.to
      ? `${filters.from ?? 'inicio'}_${filters.to ?? 'hoy'}`
      : 'todo';
  return `datos-medicos-${range}-${formatStamp(new Date())}.${format}`;
}

/**
 * Descarga los datos médicos en PDF o CSV en el navegador (web).
 *
 * En web no existe `expo-file-system`, así que usamos `fetch` + un enlace de
 * descarga, igual que hace la versión web del proyecto.
 */
export async function exportMedicalData(
  format: MedicalExportFormat,
  filters: MedicalExportFilters = {},
): Promise<void> {
  const token = useAuthStore.getState().accessToken;
  if (!token) {
    throw new Error('No hay una sesión activa para exportar los datos.');
  }

  const params = new URLSearchParams();
  params.set('format', format);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);

  const url = `${BASE_URL}/export/medical-data?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Language': i18n.resolvedLanguage ?? i18n.language,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor para exportar los datos.');
  }

  if (!response.ok) {
    let message = 'No se pudo exportar los datos.';
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      // El cuerpo no es JSON; usamos el mensaje genérico.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = buildFilename(format, filters);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
