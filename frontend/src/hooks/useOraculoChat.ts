import { useCallback, useEffect, useState } from 'react';
import { oraculoApi, type OraculoConversation, type OraculoMessage } from '../apis/oraculo';

export function useOraculoChat() {
  const [conversations, setConversations] = useState<OraculoConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<OraculoMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await oraculoApi.listConversations();
      setConversations(data);
      setError(null);
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

  const sendMessage = useCallback(
    async (content: string) => {
      setSending(true);
      setError(null);
      try {
        let conversationId = activeConversationId;
        if (!conversationId) {
          const conversation = await oraculoApi.startConversation();
          setConversations((prev) => [conversation, ...prev]);
          setActiveConversationId(conversation.id);
          setMessages([]);
          conversationId = conversation.id;
        }

        const result = await oraculoApi.sendMessage(conversationId, content);
        setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, updatedAt: new Date().toISOString() } : c,
          ),
        );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setSending(false);
      }
    },
    [activeConversationId],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await oraculoApi.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [activeConversationId],
  );

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
    deleteConversation,
  };
}
