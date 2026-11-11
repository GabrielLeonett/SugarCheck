import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GLUCO_GESTURES } from '@/constants/gestures';
import { useTheme } from '@/contexts/ThemeContext';
import { leccionesPorNivel } from '@/src/data/caminoLessons';
import type { Pregunta } from '@/src/data/caminoLessons';
import { getCaminoVideoUrl } from '@/src/data/caminoVideoUrls';

interface PathMissionProps {
  level: number;
  onExit: () => void;
  onComplete: (level: number) => Promise<boolean>;
}

type AnswerState = 'idle' | 'correct' | 'incorrect';

export function PathMission({ level, onExit, onComplete }: PathMissionProps) {
  const { colors } = useTheme();
  const { i18n, t } = useTranslation('screens');
  const insets = useSafeAreaInsets();
  const lesson = leccionesPorNivel[level];
  const videoUri = getCaminoVideoUrl(level);
  const player = useVideoPlayer({ uri: videoUri }, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.timeUpdateEventInterval = 1;
  });
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(player.status !== 'readyToPlay');
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [lives, setLives] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showNoLives, setShowNoLives] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEventListener(player, 'statusChange', ({ status }) => {
    setVideoLoading(status === 'loading' || status === 'idle');
    setVideoError(status === 'error');
  });
  useEventListener(player, 'playToEnd', () => setVideoEnded(true));

  if (!lesson || lesson.preguntas.length === 0) {
    return (
      <View style={styles.center}>
        <ThemedText>{t('warriorPath.noLevels')}</ThemedText>
        <Button title={t('warriorPath.returnToMap')} onPress={onExit} />
      </View>
    );
  }

  const currentQuestion: Pregunta | undefined =
    questionIndex >= 0 ? lesson.preguntas[questionIndex] : undefined;
  const isMultiAnswer = currentQuestion?.tipo === 'multiple';
  const progress = questionIndex < 0
    ? 0
    : ((questionIndex + (answerState === 'idle' ? 0 : 1)) / lesson.preguntas.length) * 100;

  const toggleAnswer = (index: number) => {
    if (answerState !== 'idle') return;
    setSelectedAnswers((answers) => {
      if (!isMultiAnswer) return [index];
      return answers.includes(index)
        ? answers.filter((answer) => answer !== index)
        : [...answers, index];
    });
  };

  const checkAnswer = () => {
    if (!currentQuestion || selectedAnswers.length === 0) return;
    const correct =
      selectedAnswers.length === currentQuestion.correctas.length &&
      selectedAnswers.every((answer) => currentQuestion.correctas.includes(answer));
    setAnswerState(correct ? 'correct' : 'incorrect');
    if (!correct) {
      setLives((remaining) => {
        const next = remaining - 1;
        if (next === 0) setShowNoLives(true);
        return next;
      });
    }
  };

  const nextQuestion = async () => {
    if (!currentQuestion) return;
    if (questionIndex + 1 < lesson.preguntas.length) {
      setQuestionIndex((index) => index + 1);
      setSelectedAnswers([]);
      setAnswerState('idle');
      setShowHint(false);
      return;
    }
    setSaving(true);
    setSaveError(false);
    try {
      const completed = await onComplete(level);
      if (!completed) setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const retryVideo = () => {
    setVideoError(false);
    setVideoLoading(true);
    setVideoEnded(false);
    player.replace({ uri: videoUri });
  };

  const requestExit = () => {
    player.pause();
    setShowExit(true);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={requestExit}
          accessibilityRole="button"
          accessibilityLabel={t('common:close', { ns: 'common' })}
        >
          <FontAwesome name="times" size={23} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={[styles.progressTrack, { backgroundColor: colors.divider }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: colors.primary.main },
            ]}
          />
        </View>
        <View style={styles.lives} accessibilityLabel={`${t('warriorPath.lives')}: ${lives}`}>
          {[0, 1, 2].map((heart) => (
            <FontAwesome
              key={heart}
              name="heart"
              size={17}
              color={heart < lives ? colors.error.main : colors.text.disabled}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {questionIndex < 0 ? (
          <View style={styles.videoSection}>
            <ThemedText type="h6" style={styles.missionTitle}>
              {t(`warriorPath.lessonTitles.${level}`, { defaultValue: lesson.titulo })}
            </ThemedText>
            <View style={[styles.videoContainer, { backgroundColor: colors.text.primary }]}>
              <VideoView
                player={player}
                style={styles.video}
                nativeControls
                contentFit="contain"
                allowsFullscreen
                requiresLinearPlayback
                playsInline
              />
              {videoLoading && (
                <View style={styles.videoOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              {videoError && (
                <View style={styles.videoOverlay}>
                  <ThemedText style={styles.videoErrorText}>
                    {t('warriorPath.videoError')}
                  </ThemedText>
                  <Button title={t('warriorPath.retry')} onPress={retryVideo} />
                </View>
              )}
            </View>
            <ThemedText muted style={styles.videoCaption}>
              {t('warriorPath.videoRequired')}
            </ThemedText>
            <Button
              title={t('warriorPath.continueToQuestions')}
              onPress={() => setQuestionIndex(0)}
              disabled={!videoEnded}
              icon={<FontAwesome name="arrow-right" size={16} color={colors.primary.contrastText} />}
            />
          </View>
        ) : currentQuestion ? (
          <View style={styles.quizSection}>
            <ThemedText muted style={styles.questionCount}>
              {t('warriorPath.question', {
                current: questionIndex + 1,
                total: lesson.preguntas.length,
              })}
            </ThemedText>
            <ThemedText type="h6" style={styles.missionTitle}>
              {t(`warriorPath.lessonTitles.${level}`, { defaultValue: lesson.titulo })}
            </ThemedText>
            {i18n.resolvedLanguage !== 'es' && (
              <ThemedText muted style={styles.languageNotice}>
                {t('warriorPath.lessonContentSpanishNotice')}
              </ThemedText>
            )}
            <ThemedText type="defaultSemiBold" style={styles.questionText}>
              {currentQuestion.enunciado}
            </ThemedText>

            <View style={styles.options}>
              {currentQuestion.opciones.map((option, index) => {
                const selected = selectedAnswers.includes(index);
                const revealed = answerState !== 'idle';
                const correctAnswer = currentQuestion.correctas.includes(index);
                const optionBorder = revealed && correctAnswer
                  ? colors.success.main
                  : revealed && selected
                    ? colors.error.main
                    : selected
                      ? colors.primary.main
                      : colors.border;
                return (
                  <TouchableOpacity
                    key={`${currentQuestion.id}-${index}`}
                    onPress={() => toggleAnswer(index)}
                    disabled={revealed}
                    activeOpacity={0.75}
                    accessibilityRole={isMultiAnswer ? 'checkbox' : 'radio'}
                    accessibilityState={{ selected, disabled: revealed }}
                    style={[
                      styles.option,
                      {
                        borderColor: optionBorder,
                        backgroundColor: revealed && correctAnswer
                          ? colors.success.light
                          : revealed && selected
                            ? colors.error.light
                            : selected
                              ? colors.primary[50]
                              : colors.background.paper,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={selected ? (isMultiAnswer ? 'check-square' : 'dot-circle-o') : (isMultiAnswer ? 'square-o' : 'circle-o')}
                      size={20}
                      color={optionBorder}
                    />
                    <ThemedText style={styles.optionText}>{option}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showHint && (
              <Card style={[styles.hintCard, { backgroundColor: colors.info.light }]}>
                <ThemedText>{t('warriorPath.hintText')}</ThemedText>
              </Card>
            )}

            {answerState !== 'idle' && (
              <Card
                style={[
                  styles.feedback,
                  { backgroundColor: answerState === 'correct' ? colors.success.light : colors.error.light },
                ]}
              >
                <View style={styles.feedbackRow}>
                  <Image
                    source={answerState === 'correct'
                      ? GLUCO_GESTURES.ataqueVictoria
                      : GLUCO_GESTURES.preguntaConfusa}
                    style={styles.feedbackMascot}
                    resizeMode="contain"
                  />
                  <View style={styles.feedbackCopy}>
                    <View style={styles.feedbackHeading}>
                      <FontAwesome
                        name={answerState === 'correct' ? 'check-circle' : 'times-circle'}
                        size={24}
                        color={answerState === 'correct' ? colors.success.dark : colors.error.dark}
                      />
                      <ThemedText type="defaultSemiBold">
                        {t(answerState === 'correct' ? 'warriorPath.correctTitle' : 'warriorPath.incorrectTitle')}
                      </ThemedText>
                    </View>
                    <ThemedText>
                      {answerState === 'correct'
                        ? currentQuestion.retroCorrecta
                        : currentQuestion.retroIncorrecta}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            )}

            {saveError && (
              <Card style={[styles.hintCard, { backgroundColor: colors.error.light }]}>
                <ThemedText>{t('warriorPath.saveError')}</ThemedText>
              </Card>
            )}

            <View style={styles.actions}>
              {answerState === 'idle' ? (
                <>
                  <Button
                    title={t('warriorPath.hint')}
                    variant="outlined"
                    onPress={() => setShowHint((visible) => !visible)}
                    icon={<FontAwesome name="lightbulb-o" size={17} color={colors.primary.main} />}
                    style={styles.actionButton}
                  />
                  <Button
                    title={t('warriorPath.check')}
                    onPress={checkAnswer}
                    disabled={selectedAnswers.length === 0}
                    style={styles.actionButton}
                  />
                </>
              ) : (
                <Button
                  title={saveError ? t('warriorPath.retry') : t('warriorPath.continue')}
                  onPress={nextQuestion}
                  loading={saving}
                  disabled={lives === 0}
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={showExit} onClose={() => setShowExit(false)}>
        <View style={styles.dialog}>
          <ThemedText type="h6" style={styles.dialogTitle}>{t('warriorPath.exitTitle')}</ThemedText>
          <ThemedText muted style={styles.dialogDescription}>
            {t('warriorPath.exitDescription')}
          </ThemedText>
          <Button
            title={t('warriorPath.exitCancel')}
            onPress={() => {
              setShowExit(false);
              if (!videoEnded && questionIndex < 0 && !videoError) player.play();
            }}
          />
          <Button
            title={t('warriorPath.exitConfirm')}
            variant="outlined"
            color="danger"
            onPress={() => {
              setShowExit(false);
              onExit();
            }}
          />
        </View>
      </Modal>

      <Modal visible={showNoLives} onClose={() => {
        setShowNoLives(false);
        onExit();
      }}>
        <View style={styles.dialog}>
          <Image
            source={GLUCO_GESTURES.tristeCansado}
            style={styles.dialogMascot}
            resizeMode="contain"
          />
          <ThemedText type="h6" style={styles.dialogTitle}>{t('warriorPath.noLivesTitle')}</ThemedText>
          <ThemedText muted style={styles.dialogDescription}>
            {t('warriorPath.noLivesDescription')}
          </ThemedText>
          <Button
            title={t('warriorPath.returnToMap')}
            color="error"
            onPress={() => {
              setShowNoLives(false);
              onExit();
            }}
          />
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 12 },
  closeButton: { width: 32, alignItems: 'center' },
  progressTrack: { flex: 1, height: 12, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  lives: { flexDirection: 'row', gap: 4 },
  content: { flexGrow: 1, padding: 18, paddingBottom: 32 },
  videoSection: { flex: 1, justifyContent: 'center', gap: 16 },
  missionTitle: { textAlign: 'center', marginBottom: 8 },
  videoContainer: { width: '100%', aspectRatio: 16 / 9, borderRadius: 14, overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  videoErrorText: { color: '#fff', textAlign: 'center' },
  videoCaption: { textAlign: 'center', fontSize: 13 },
  quizSection: { paddingBottom: 24 },
  questionCount: { textAlign: 'center', marginBottom: 8 },
  questionText: { textAlign: 'center', marginVertical: 18, lineHeight: 25 },
  languageNotice: { fontSize: 13, textAlign: 'center' },
  options: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1.5, borderRadius: 12, padding: 14 },
  optionText: { flex: 1, lineHeight: 22 },
  hintCard: { padding: 14, marginTop: 16 },
  feedback: { padding: 16, marginTop: 18 },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedbackMascot: { width: 64, height: 72 },
  feedbackCopy: { flex: 1, gap: 8 },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionButton: { flex: 1 },
  dialog: { gap: 14, paddingBottom: 18 },
  dialogMascot: { width: 112, height: 112, alignSelf: 'center' },
  dialogTitle: { textAlign: 'center' },
  dialogDescription: { textAlign: 'center', marginBottom: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
});
