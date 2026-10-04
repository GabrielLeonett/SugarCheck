import { apiPrivate } from './axios';
import { ApiError } from './api-error';
import { useAuthStore } from '../stores/authStore';
import i18n from '../stores/i18n';
import type { BackendErrorResponse } from '../types/types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface OraculoMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface OraculoConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: OraculoMessage[];
}

export interface SendMessageResult {
  conversationId: string;
  userMessage: OraculoMessage;
  assistantMessage: OraculoMessage;
}

export type OraculoStreamEvent =
  | { type: 'meta'; userMessage: OraculoMessage }
  | { type: 'delta'; text: string }
  | { type: 'done'; assistantMessage: OraculoMessage }
  | { type: 'error'; message: string };

/**
 * El interceptor de axios ya convierte cualquier fallo en `ApiError`, así que
 * leer `error.response` acá devolvía siempre `undefined` y todos los errores
 * terminaban mostrándose como "Error inesperado del Oráculo".
 */
function handleError(error: unknown): never {
  if (error instanceof ApiError) throw error;
  if (error instanceof Error) throw error;
  throw new Error('Error inesperado del Oráculo');
}

/** Mismo criterio que el interceptor de axios, para las llamadas con `fetch`. */
function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    'Accept-Language': i18n.language || 'es',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const oraculoApi = {
  async listConversations(): Promise<OraculoConversation[]> {
    try {
      const res = await apiPrivate.get('/oraculo/conversations');
      return res.data as OraculoConversation[];
    } catch (error) {
      return handleError(error);
    }
  },

  async startConversation(title?: string): Promise<OraculoConversation> {
    try {
      const res = await apiPrivate.post('/oraculo/conversations', { title });
      return res.data as OraculoConversation;
    } catch (error) {
      return handleError(error);
    }
  },

  async getConversation(id: string): Promise<OraculoConversation> {
    try {
      const res = await apiPrivate.get(`/oraculo/conversations/${id}`);
      return res.data as OraculoConversation;
    } catch (error) {
      return handleError(error);
    }
  },

  async sendMessage(id: string, content: string): Promise<SendMessageResult> {
    try {
      const res = await apiPrivate.post(`/oraculo/conversations/${id}/messages`, { content });
      return res.data as SendMessageResult;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Envía el mensaje y entrega la respuesta del asistente a medida que llega.
   *
   * No se puede usar axios aquí porque su interceptor espera la respuesta
   * completa: hace falta `fetch` con `ReadableStream` para ir mostrando los
   * trozos a medida que Gemini los emite.
   */
  async streamMessage(
    id: string,
    content: string,
    onEvent: (event: OraculoStreamEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/oraculo/conversations/${id}/messages/stream`, {
        method: 'POST',
        headers: authHeaders(),
        // El token también viaja en cookie httpOnly.
        credentials: 'include',
        body: JSON.stringify({ content }),
        signal,
      });
    } catch (error) {
      // Abortar es una acción del usuario, no un fallo que haya que mostrar.
      if (signal?.aborted) return;
      throw error instanceof Error ? error : new Error('No se pudo conectar con el Oráculo');
    }

    if (!response.ok) {
      // El backend valida antes de abrir el stream, así que los rechazos
      // llegan como JSON normal y se pueden mostrar su mensaje real.
      const data = await response.json().catch(() => undefined);
      const body = data as BackendErrorResponse | undefined;
      throw new ApiError(
        body?.message || 'No se pudo enviar el mensaje',
        body?.code || 'ORACLE_STREAM_ERROR',
        body?.field,
        body?.statusCode || response.status,
      );
    }

    if (!response.body) {
      throw new Error('El Oráculo no devolvió ninguna respuesta');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Los eventos SSE llegan partidos entre lecturas, así que se acumulan en
    // `buffer` hasta encontrar el separador completo. El backend los emite con
    // CRLF (como dicta el spec de SSE), por eso se buscan ambos.
    const drain = (flush: boolean) => {
      for (let boundary = findBoundary(buffer); boundary; boundary = findBoundary(buffer)) {
        const event = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary.length);
        handleEvent(event, onEvent);
      }
      if (flush && buffer.trim()) {
        handleEvent(buffer, onEvent);
        buffer = '';
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          drain(true);
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        drain(false);
      }
    } finally {
      reader.releaseLock();
    }
  },

  async deleteConversation(id: string): Promise<void> {
    try {
      await apiPrivate.delete(`/oraculo/conversations/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};

function findBoundary(buffer: string): { index: number; length: number } | null {
  const crlf = buffer.indexOf('\r\n\r\n');
  const lf = buffer.indexOf('\n\n');

  if (crlf !== -1 && (lf === -1 || crlf <= lf + 1)) {
    return { index: crlf, length: 4 };
  }
  if (lf !== -1) {
    return { index: lf, length: 2 };
  }
  return null;
}

function handleEvent(event: string, onEvent: (event: OraculoStreamEvent) => void): void {
  const line = event.split('\n').find((l) => l.startsWith('data:'));
  if (!line) return;

  const data = line.slice(5).trim();
  if (!data || data === '[DONE]') return;

  try {
    onEvent(JSON.parse(data) as OraculoStreamEvent);
  } catch {
    // Evento corrupto: se ignora en vez de cortar la respuesta ya empezada.
  }
}
