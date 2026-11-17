import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
 * Descarga los datos médicos en formato PDF o CSV y abre la hoja de compartir
 * para que el usuario pueda guardarlos o enviarlos.
 *
 * Usa el endpoint `GET /export/medical-data` del backend, que requiere sesión.
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
  const filename = buildFilename(format, filters);
  const destination = new File(Paths.cache, filename);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Accept-Language': i18n.resolvedLanguage ?? i18n.language,
  };

  let file: File;
  try {
    file = await File.downloadFileAsync(url, destination, {
      headers,
      idempotent: true,
    });
  } catch (error) {
    // expo-file-system arroja errores en inglés; mostramos un mensaje claro.
    const detail = error instanceof Error ? error.message : '';
    throw new Error(
      detail ? `No se pudo exportar los datos (${detail}).` : 'No se pudo exportar los datos.',
    );
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartir archivos no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: format === 'pdf' ? 'application/pdf' : 'text/csv',
    dialogTitle: filename,
  });
}
