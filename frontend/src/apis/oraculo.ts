import type { AxiosError } from 'axios';
import { apiPrivate } from './axios';
import type { BackendErrorResponse } from '../types/types';

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

function handleError(error: unknown): never {
  const err = error as AxiosError<BackendErrorResponse>;
  throw new Error(err.response?.data?.message || 'Error inesperado del Oráculo');
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

  async deleteConversation(id: string): Promise<void> {
    try {
      await apiPrivate.delete(`/oraculo/conversations/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};
