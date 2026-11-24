import { fetch as expoFetch } from 'expo/fetch';

import { apiPrivate } from './axios';
import { useAuthStore } from '../stores/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

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

interface BackendErrorBody {
  message?: string | string[];
  statusCode?: number;
}

function authHeaders(token: string | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function errorMessageFrom(error: unknown, fallback: string): string {
  const axiosMessage = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(axiosMessage)) return axiosMessage.join('\n');
  if (typeof axiosMessage === 'string' && axiosMessage.trim()) return axiosMessage;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

async function readStreamError(response: Response): Promise<Error> {
  let body: BackendErrorBody | undefined;
  try {
    body = (await response.json()) as BackendErrorBody;
  } catch {
    // El backend puede devolver un cuerpo vacío o no JSON.
  }

  if (Array.isArray(body?.message)) return new Error(body.message.join('\n'));
  if (typeof body?.message === 'string' && body.message.trim()) {
    return new Error(body.message);
  }
  return new Error(`No se pudo conectar con el Oráculo (${response.status})`);
}

/**
 * El interceptor de axios refresca el token en las llamadas normales. Como el
 * stream usa `expo/fetch` directamente, aquí se repite ese comportamiento una
 * sola vez antes de mostrar el error al usuario.
 */
async function openStream(
  conversationId: string,
  content: string,
  signal?: AbortSignal,
): Promise<Response> {
  const request = (token: string | null) =>
    expoFetch(`${BASE_URL}/oraculo/conversations/${conversationId}/messages/stream`, {
      method: 'POST',
      headers: authHeaders(token),
      credentials: 'include',
      body: JSON.stringify({ content }),
      signal,
    });

  let response = await request(useAuthStore.getState().accessToken);

  if (response.status === 401) {
    const refreshedToken = await useAuthStore.getState().refresh();
    if (refreshedToken) {
      response = await request(refreshedToken);
    }
  }

  return response;
}

export const oraculoApi = {
  async listConversations(): Promise<OraculoConversation[]> {
    try {
      const response = await apiPrivate.get('/oraculo/conversations');
      return response.data as OraculoConversation[];
    } catch (error) {
      throw new Error(errorMessageFrom(error, 'No se pudieron cargar las conversaciones'));
    }
  },

  async startConversation(title?: string): Promise<OraculoConversation> {
    try {
      const response = await apiPrivate.post('/oraculo/conversations', { title });
      return response.data as OraculoConversation;
    } catch (error) {
      throw new Error(errorMessageFrom(error, 'No se pudo iniciar la conversación'));
    }
  },

  async getConversation(id: string): Promise<OraculoConversation> {
    try {
      const response = await apiPrivate.get(`/oraculo/conversations/${id}`);
      return response.data as OraculoConversation;
    } catch (error) {
      throw new Error(errorMessageFrom(error, 'No se pudo cargar la conversación'));
    }
  },

  async sendMessage(id: string, content: string): Promise<SendMessageResult> {
    try {
      const response = await apiPrivate.post(`/oraculo/conversations/${id}/messages`, {
        content,
      });
      return response.data as SendMessageResult;
    } catch (error) {
      throw new Error(errorMessageFrom(error, 'No se pudo enviar el mensaje'));
    }
  },

  /**
   * Envía el mensaje y va entregando la respuesta a medida que llega. `expo/fetch`
   * es necesario en móvil porque el fetch estándar de React Native no expone
   * `response.body` como stream.
   */
  async streamMessage(
    id: string,
    content: string,
    onEvent: (event: OraculoStreamEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const response = await openStream(id, content, signal);

    if (!response.ok) {
      throw await readStreamError(response);
    }

    if (!response.body) {
      throw new Error('El Oráculo no devolvió ninguna respuesta');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
      throw new Error(errorMessageFrom(error, 'No se pudo eliminar la conversación'));
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
    // Un evento corrupto se ignora en vez de cortar la respuesta ya empezada.
  }
}
