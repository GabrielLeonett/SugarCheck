import { useCallback, useEffect, useRef, useState } from 'react';

import {
  oraculoApi,
  type OraculoConversation,
  type OraculoMessage,
} from '@/src/apis/oraculo';

/** Id interno de la respuesta que se está escribiendo en pantalla. */
const STREAMING_ID = '__streaming__';

export function useOraculoChat(userId?: string | null) {
  const [conversations, setConversations] = useState<OraculoConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<OraculoMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    activeRef.current = activeConversationId;
  }, [activeConversationId]);

  const loadConversations = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    activeRef.current = null;
    sendingRef.current = false;
    setSending(false);
    setActiveConversationId(null);
    setMessages([]);
    setConversations([]);

    if (!userId) {
      setError(null);
      return;
    }

    setLoadingConversations(true);
    try {
      const data = await oraculoApi.listConversations();
      const sorted = [...data].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      setConversations(sorted);
      setError(null);

      if (!activeRef.current) {
        const recent = sorted[0];
        if (recent) {
          activeRef.current = recent.id;
          setActiveConversationId(recent.id);
          setMessages(recent.messages ?? []);
        } else {
          setMessages([]);
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el chat');
    } finally {
      setLoadingConversations(false);
    }
  }, [userId]);

  const selectConversation = useCallback(async (id: string) => {
    abortRef.current?.abort();
    abortRef.current = null;
    sendingRef.current = false;
    setSending(false);
    setLoadingMessages(true);
    try {
      const conversation = await oraculoApi.getConversation(id);
      activeRef.current = id;
      setActiveConversationId(id);
      setMessages(conversation.messages ?? []);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar la conversación');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const touchConversation = useCallback((id: string) => {
    const now = new Date().toISOString();
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id ? { ...conversation, updatedAt: now } : conversation,
      ),
    );
  }, []);

  const startNewConversation = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    sendingRef.current = false;
    setSending(false);
    setLoadingMessages(true);

    try {
      const conversation = await oraculoApi.startConversation();
      activeRef.current = conversation.id;
      setConversations((previous) => [conversation, ...previous]);
      setActiveConversationId(conversation.id);
      setMessages([]);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo iniciar la conversación');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || !userId || sendingRef.current) return;

      sendingRef.current = true;
      setSending(true);
      setError(null);

      let conversationId = activeRef.current;
      if (!conversationId) {
        try {
          const conversation = await oraculoApi.startConversation();
          conversationId = conversation.id;
          activeRef.current = conversation.id;
          setConversations((previous) => [conversation, ...previous]);
          setActiveConversationId(conversation.id);
          setMessages([]);
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : 'No se pudo iniciar la conversación');
          sendingRef.current = false;
          setSending(false);
          return;
        }
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const optimisticId = `__pending__${Date.now()}`;
      setMessages((previous) => [
        ...previous,
        {
          id: optimisticId,
          conversationId: conversationId!,
          role: 'user',
          content: text,
          createdAt: new Date().toISOString(),
        },
        {
          id: STREAMING_ID,
          conversationId: conversationId!,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ]);

      const isStale = () => activeRef.current !== conversationId;
      let failed = false;

      try {
        await oraculoApi.streamMessage(
          conversationId,
          text,
          (event) => {
            if (isStale()) return;

            if (event.type === 'meta') {
              setMessages((previous) => {
                const withoutPending = previous.filter((message) => message.id !== optimisticId);
                const alreadyThere = withoutPending.some(
                  (message) => message.id === event.userMessage.id,
                );
                return alreadyThere ? withoutPending : [...withoutPending, event.userMessage];
              });
              setConversations((previous) =>
                previous.map((conversation) =>
                  conversation.id === conversationId
                    ? {
                        ...conversation,
                        messages: [...(conversation.messages ?? []), event.userMessage],
                      }
                    : conversation,
                ),
              );
            }

            if (event.type === 'delta') {
              setMessages((previous) =>
                previous.map((message) =>
                  message.id === STREAMING_ID
                    ? { ...message, content: message.content + event.text }
                    : message,
                ),
              );
            }

            if (event.type === 'done') {
              setMessages((previous) => [
                ...previous.filter((message) => message.id !== STREAMING_ID),
                event.assistantMessage,
              ]);
              setConversations((previous) =>
                previous.map((conversation) =>
                  conversation.id === conversationId
                    ? {
                        ...conversation,
                        updatedAt: new Date().toISOString(),
                        messages: [
                          ...(conversation.messages ?? []),
                          event.assistantMessage,
                        ],
                      }
                    : conversation,
                ),
              );
            }

            if (event.type === 'error') {
              failed = true;
              setError(event.message);
              setMessages((previous) =>
                previous.filter((message) => message.id !== STREAMING_ID),
              );
            }
          },
          controller.signal,
        );

        if (!isStale() && !failed) {
          touchConversation(conversationId);
          setError(null);
        }
      } catch (caught) {
        if (controller.signal.aborted) {
          // Cancelado por el usuario: se conserva lo que ya se alcanzó a escribir.
          setMessages((previous) =>
            previous.flatMap((message) => {
              if (message.id !== STREAMING_ID) return [message];
              return message.content
                ? [{ ...message, id: `__partial__${Date.now()}` }]
                : [];
            }),
          );
        } else {
          setError(caught instanceof Error ? caught.message : 'No se pudo enviar el mensaje');
          setMessages((previous) =>
            previous.filter((message) => message.id !== STREAMING_ID),
          );
        }
      } finally {
        // Si el evento `meta` no llegó, el mensaje optimista se conserva con un
        // id local para que el usuario no pierda lo que escribió.
        setMessages((previous) =>
          previous.map((message) =>
            message.id === optimisticId
              ? { ...message, id: `__local__${Date.now()}` }
              : message,
          ),
        );
        abortRef.current = null;
        sendingRef.current = false;
        setSending(false);
      }
    },
    [touchConversation, userId],
  );

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    sendingRef.current = false;
    setSending(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await oraculoApi.deleteConversation(id);
        setConversations((previous) =>
          previous.filter((conversation) => conversation.id !== id),
        );
        if (activeRef.current === id) {
          abortRef.current?.abort();
          abortRef.current = null;
          activeRef.current = null;
          sendingRef.current = false;
          setActiveConversationId(null);
          setMessages([]);
          setSending(false);
        }
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo eliminar la conversación');
      }
    },
    [],
  );

  useEffect(() => {
    // Se difiere un tick para que la carga inicial no bloquee el primer render.
    const timer = setTimeout(() => {
      void loadConversations();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    loadConversations,
    selectConversation,
    startNewConversation,
    sendMessage,
    stopGenerating,
    clearError,
    deleteConversation,
  };
}
