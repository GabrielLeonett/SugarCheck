import { useCallback, useEffect, useRef, useState } from 'react';
import { oraculoApi, type OraculoConversation, type OraculoMessage } from '../apis/oraculo';

/** Id interno de la respuesta que se está escribiendo en pantalla. */
const STREAMING_ID = '__streaming__';

export function useOraculoChat() {
  const [conversations, setConversations] = useState<OraculoConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<OraculoMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  // Si el usuario cambia de conversación mientras el modelo responde, los trozos
  // que lleguen tarde no deben aparecer en el chat que se está viendo.
  const activeRef = useRef<string | null>(null);

  useEffect(() => {
    activeRef.current = activeConversationId;
  }, [activeConversationId]);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await oraculoApi.listConversations();
      setConversations(data);
      setError(null);

      // Sin conversación activa se abre la más reciente, que es lo que espera
      // cualquiera que entre al chat. Antes quedaba en blanco.
      setActiveConversationId((current) => {
        if (current) return current;
        if (data.length === 0) return null;
        const recent = [...data].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )[0];
        return recent?.id ?? null;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    try {
      const conversation = await oraculoApi.getConversation(id);
      setActiveConversationId(id);
      setMessages(conversation.messages);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const startNewConversation = useCallback(async () => {
    try {
      const conversation = await oraculoApi.startConversation();
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
      setMessages([]);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const touchConversation = useCallback((id: string) => {
    const now = new Date().toISOString();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, updatedAt: now } : c)),
    );
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setSending(true);
      setError(null);

      let conversationId = activeRef.current;
      if (!conversationId) {
        try {
          const conversation = await oraculoApi.startConversation();
          setConversations((prev) => [conversation, ...prev]);
          setActiveConversationId(conversation.id);
          activeRef.current = conversation.id;
          setMessages([]);
          conversationId = conversation.id;
        } catch (e) {
          setError((e as Error).message);
          setSending(false);
          return;
        }
      }

      const controller = new AbortController();
      abortRef.current = controller;

      // Mensaje optimista: se ve al instante y el backend lo confirma después.
      // Si nunca llega (error o cancelación), se saca en la limpieza.
      const optimisticId = `__pending__${Date.now()}`;
      const optimistic: OraculoMessage = {
        id: optimisticId,
        conversationId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setMessages((prev) => [
        ...prev,
        {
          id: STREAMING_ID,
          conversationId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ]);

      const isStale = () => activeRef.current !== conversationId;

      try {
        await oraculoApi.streamMessage(
          conversationId,
          content,
          (event) => {
            if (isStale()) return;

            if (event.type === 'meta') {
              setMessages((prev) => {
                const withoutPending = prev.filter((m) => m.id !== optimisticId);
                const alreadyThere = withoutPending.some((m) => m.id === event.userMessage.id);
                return alreadyThere
                  ? withoutPending
                  : [...withoutPending, event.userMessage];
              });
            }

            if (event.type === 'delta') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === STREAMING_ID
                    ? { ...m, content: m.content + event.text }
                    : m,
                ),
              );
            }

            if (event.type === 'done') {
              setMessages((prev) => [
                ...prev.filter((m) => m.id !== STREAMING_ID),
                event.assistantMessage,
              ]);
            }

            if (event.type === 'error') {
              setError(event.message);
              setMessages((prev) => prev.filter((m) => m.id !== STREAMING_ID));
            }
          },
          controller.signal,
        );

        if (!isStale()) {
          touchConversation(conversationId);
          setError(null);
        }
      } catch (e) {
        if (controller.signal.aborted || isStale()) {
          // Cancelado por el usuario: se conserva lo que ya se había escrito.
          setMessages((prev) =>
            prev.map((m) =>
              m.id === STREAMING_ID
                ? { ...m, content: m.content || '(Respuesta cancelada)' }
                : m,
            ),
          );
        } else {
          setError((e as Error).message);
        }
      } finally {
        // La burbuja provisional se reemplaza por la real si llegó, y se
        // borra junto con la del asistente si la respuesta se cortó.
        setMessages((prev) => {
          const withoutPending = prev.filter((m) => m.id !== optimisticId);
          const hasRealAssistant = withoutPending.some(
            (m) => m.role === 'assistant' && m.id !== STREAMING_ID,
          );
          return hasRealAssistant
            ? withoutPending.filter((m) => m.id !== STREAMING_ID)
            : withoutPending;
        });
        abortRef.current = null;
        setSending(false);
      }
    },
    [touchConversation],
  );

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSending(false);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await oraculoApi.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeRef.current === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [],
  );

  // Si se desmonta con una respuesta en curso, se cancela para no dejar
  // escribiendo en un componente que ya no existe.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    activeConversationId,
    messages,
    loadingConversations,
    sending,
    error,
    selectConversation,
    startNewConversation,
    sendMessage,
    stopGenerating,
    deleteConversation,
  };
}
