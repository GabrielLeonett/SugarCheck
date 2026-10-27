import { isAxiosError } from 'axios';
import { apiPrivate } from './axios';

export type MedicalExportFormat = 'pdf' | 'csv';

export interface MedicalExportFilters {
  from?: string;
  to?: string;
}

function parseFilename(contentDisposition?: string): string | null {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)/i,
  );
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] ?? null;
}

async function extractErrorMessage(error: unknown): Promise<string> {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed.message) return parsed.message;
      } catch {
        // Si no es JSON, usamos el mensaje genérico de Axios.
      }
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;
  return 'Error inesperado';
}

export const medicalExportApi = {
  async download(
    format: MedicalExportFormat,
    filters: MedicalExportFilters = {},
  ): Promise<void> {
    try {
      const response = await apiPrivate.get('/export/medical-data', {
        params: {
          format,
          ...(filters.from ? { from: filters.from } : {}),
          ...(filters.to ? { to: filters.to } : {}),
        },
        responseType: 'blob',
      });

      const contentType =
        (response.headers['content-type'] as string | undefined) ??
        (format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8');
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: contentType });

      const filename =
        parseFilename(
          response.headers['content-disposition'] as string | undefined,
        ) ?? `datos-medicos.${format}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      throw new Error(await extractErrorMessage(error));
    }
  },
};
