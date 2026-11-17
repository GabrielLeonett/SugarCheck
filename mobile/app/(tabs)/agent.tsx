import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Shape } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { OraculoMessage } from '@/src/apis/oraculo';
import { useOraculoChat } from '@/src/hooks/useOraculoChat';
import { useAuthStore } from '@/src/stores/authStore';
import { useGuestStore } from '@/src/stores/guestStore';
import { showConfirmAlert } from '@/src/stores/systemAlertStore';

const GLUCO_IMAGE = require('../../assets/gluco-saludo.png');

export default function AgentScreen() {
  const { t, i18n } = useTranslation('screens');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isGuestMode = useGuestStore((state) => state.isGuestMode);

  const {
    conversations,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    selectConversation,
    startNewConversation,
    sendMessage,
    stopGenerating,
    clearError,
    deleteConversation,
  } = useOraculoChat(user?.id);

  const listRef = useRef<FlatList<OraculoMessage>>(null);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const suggestions = useMemo(
    () => [
      t('agent.suggestion1'),
      t('agent.suggestion2'),
      t('agent.suggestion3'),
    ],
    [t],
  );

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    void sendMessage(text);
  }, [input, sendMessage, sending]);

  const handleSuggestion = useCallback((suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  const handleNewConversation = useCallback(() => {
    setHistoryOpen(false);
    setInput('');
    void startNewConversation();
  }, [startNewConversation]);

  const handleOpenConversation = useCallback(
    (id: string) => {
      setHistoryOpen(false);
      setInput('');
      void selectConversation(id);
    },
    [selectConversation],
  );

  const confirmDelete = useCallback(
    (id: string) => {
      showConfirmAlert({
        title: t('agent.deleteTitle'),
        description: t('agent.deleteDescription'),
        confirmText: t('agent.deleteConfirm'),
        cancelText: t('agent.cancel'),
        destructive: true,
        onConfirm: async () => {
          await deleteConversation(id);
          setHistoryOpen(false);
        },
      });
    },
    [deleteConversation, t],
  );

  const formatDate = useCallback(
    (iso: string) => {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '';
      try {
        return new Intl.DateTimeFormat(i18n.language || 'es', {
          day: '2-digit',
          month: 'short',
        }).format(date);
      } catch {
        return date.toLocaleDateString();
      }
    },
    [i18n.language],
  );

  const renderMessage = useCallback(
    ({ item }: { item: OraculoMessage }) => {
      const isUser = item.role === 'user';
      const isStreaming = item.id === '__streaming__';
      const hasText = item.content.trim().length > 0;

      return (
        <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
          {!isUser && (
            <Image source={GLUCO_IMAGE} style={styles.messageAvatar} resizeMode="contain" />
          )}

          <View
            style={[
              styles.bubble,
              isUser
                ? { backgroundColor: colors.primary.main, borderBottomRightRadius: 4 }
                : {
                    backgroundColor: colors.background.paper,
                    borderColor: colors.border,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderBottomLeftRadius: 4,
                  },
            ]}
          >
            {isStreaming && !hasText ? (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color={colors.primary.main} />
                <Text style={[styles.thinkingText, { color: colors.text.secondary }]}>
                  {t('agent.thinking')}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.messageText,
                  { color: isUser ? colors.primary.contrastText : colors.text.primary },
                ]}
              >
                {item.content}
                {isStreaming ? ' ▍' : ''}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [colors, t],
  );

  const header = (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 10,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <View style={styles.identity}>
        <View style={[styles.avatarFrame, { backgroundColor: colors.surface }]}>
          <Image source={GLUCO_IMAGE} style={styles.headerAvatar} resizeMode="contain" />
        </View>
        <View style={styles.identityText}>
          <ThemedText type="h5">{t('agent.title')}</ThemedText>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: colors.success.main }]} />
            <ThemedText muted type="caption">
              {t('agent.online')}
            </ThemedText>
          </View>
        </View>
      </View>

      {user && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background.paper, borderColor: colors.border },
            ]}
            onPress={() => setHistoryOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('agent.historyTitle')}
          >
            <FontAwesome name="clock-o" size={18} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
            ]}
            onPress={handleNewConversation}
            accessibilityRole="button"
            accessibilityLabel={t('agent.newConversation')}
          >
            <FontAwesome name="plus" size={18} color={colors.primary.contrastText} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        {header}
        <View style={styles.guestContent}>
          <Card style={styles.guestCard}>
            <Image source={GLUCO_IMAGE} style={styles.guestImage} resizeMode="contain" />
            <ThemedText type="h5" style={styles.guestTitle}>
              {t('agent.loginTitle')}
            </ThemedText>
            <ThemedText muted style={styles.guestDescription}>
              {t('agent.loginDescription')}
            </ThemedText>
            <Button
              title={t('agent.loginButton')}
              onPress={() => router.push('/auth/login')}
              style={styles.loginButton}
              icon={<FontAwesome name="sign-in" size={16} color={colors.primary.contrastText} />}
            />
            {isGuestMode && (
              <ThemedText muted type="caption" style={styles.guestNote}>
                {t('agent.loginGuestNote')}
              </ThemedText>
            )}
          </Card>
        </View>
      </ThemedView>
    );
  }

  const showLoading = (loadingConversations || loadingMessages) && messages.length === 0;

  return (
    <ThemedView style={styles.container}>
      {header}

      {error && (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: colors.background.paper, borderColor: colors.error.main },
          ]}
        >
          <FontAwesome name="exclamation-circle" size={16} color={colors.error.main} />
          <Text style={[styles.errorText, { color: colors.error.main }]}>{error}</Text>
          <TouchableOpacity onPress={clearError} accessibilityRole="button">
            <FontAwesome name="close" size={14} color={colors.error.main} />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <ThemedText muted style={styles.loadingText}>
              {t('agent.loading')}
            </ThemedText>
          </View>
        ) : messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContent}
            keyboardShouldPersistTaps="handled"
          >
            <Image source={GLUCO_IMAGE} style={styles.emptyImage} resizeMode="contain" />
            <ThemedText type="h5" style={styles.emptyTitle}>
              {t('agent.emptyTitle')}
            </ThemedText>
            <ThemedText muted style={styles.emptyDescription}>
              {t('agent.emptyDescription')}
            </ThemedText>

            <View style={styles.suggestions}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={[
                    styles.suggestion,
                    { backgroundColor: colors.background.paper, borderColor: colors.border },
                  ]}
                  onPress={() => handleSuggestion(suggestion)}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="comment-o" size={14} color={colors.primary.main} />
                  <Text style={[styles.suggestionText, { color: colors.text.primary }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText muted type="caption" style={styles.disclaimer}>
              {t('agent.disclaimer')}
            </ThemedText>
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(message) => message.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToEnd}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View
          style={[
            styles.composerWrapper,
            {
              backgroundColor: colors.background.default,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <View
            style={[
              styles.composer,
              { backgroundColor: colors.background.paper, borderColor: colors.border },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder={t('agent.inputPlaceholder')}
              placeholderTextColor={colors.text.disabled}
              style={[styles.input, { color: colors.text.primary }]}
              multiline
              maxLength={4000}
              selectionColor={colors.primary.main}
              editable={!loadingConversations && !loadingMessages}
            />
            <TouchableOpacity
              onPress={sending ? stopGenerating : handleSend}
              disabled={!sending && !input.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor: sending
                    ? colors.error.main
                    : input.trim()
                      ? colors.primary.main
                      : colors.action.disabledBackground,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={sending ? t('agent.stop') : t('agent.send')}
            >
              <FontAwesome
                name={sending ? 'stop' : 'send'}
                size={17}
                color={
                  sending || input.trim()
                    ? colors.primary.contrastText
                    : colors.text.disabled
                }
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.composerHint, { color: colors.text.disabled }]}>
            {t('agent.composerHint')}
          </Text>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={historyOpen} onClose={() => setHistoryOpen(false)}>
        <View style={styles.historyHeader}>
          <ThemedText type="h5">{t('agent.historyTitle')}</ThemedText>
          <TouchableOpacity
            onPress={() => setHistoryOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t('agent.close')}
          >
            <FontAwesome name="close" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {conversations.length === 0 ? (
          <ThemedText muted style={styles.historyEmpty}>
            {t('agent.historyEmpty')}
          </ThemedText>
        ) : (
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {conversations.map((conversation) => {
              const conversationMessages = conversation.messages ?? [];
              const lastMessage = conversationMessages[conversationMessages.length - 1];
              return (
                <View
                  key={conversation.id}
                  style={[styles.historyRow, { borderBottomColor: colors.divider }]}
                >
                  <TouchableOpacity
                    style={styles.historyMain}
                    onPress={() => handleOpenConversation(conversation.id)}
                    activeOpacity={0.75}
                  >
                    <ThemedText numberOfLines={1} style={styles.historyTitle}>
                      {conversation.title}
                    </ThemedText>
                    <ThemedText muted type="caption" numberOfLines={1}>
                      {lastMessage?.content || formatDate(conversation.updatedAt)}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(conversation.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('agent.deleteConversation')}
                  >
                    <FontAwesome name="trash-o" size={17} color={colors.error.main} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}

        <Button
          title={t('agent.newConversation')}
          onPress={handleNewConversation}
          style={styles.newConversationButton}
          icon={
            <FontAwesome
              name="plus"
              size={15}
              color={colors.primary.contrastText}
            />
          }
        />
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarFrame: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 44,
    height: 44,
  },
  identityText: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  emptyImage: {
    width: 110,
    height: 110,
    marginBottom: 12,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  suggestions: {
    width: '100%',
    gap: 10,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: Shape.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 17,
  },
  messagesContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '92%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    marginBottom: 2,
  },
  bubble: {
    flexShrink: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  composerWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 5,
    paddingVertical: 5,
    gap: 6,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 112,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 9,
    paddingBottom: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  composerHint: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  guestContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  guestCard: {
    alignItems: 'center',
    padding: 24,
  },
  guestImage: {
    width: 108,
    height: 108,
    marginBottom: 8,
  },
  guestTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  guestDescription: {
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 4,
  },
  guestNote: {
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyList: {
    maxHeight: 380,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 8,
  },
  historyMain: {
    flex: 1,
    gap: 3,
  },
  historyTitle: {
    fontFamily: Fonts.medium,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmpty: {
    textAlign: 'center',
    paddingVertical: 28,
  },
  newConversationButton: {
    marginTop: 14,
  },
});
