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
import { CaminoWorldDecor } from './CaminoWorldDecor';
import { getCaminoWorld, withAlpha } from './caminoWorlds';

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

  const worldNumber = Math.ceil(level / 3);
  const world = getCaminoWorld(worldNumber);
  const accent = colors.world[world.accentKey];

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

  const missionTitle = t(`warriorPath.lessonTitles.${level}`, { defaultValue: lesson.titulo });

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
      <CaminoWorldDecor
        world={worldNumber}
        accent={accent}
        contrast={colors.onAccent}
        height={260}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={requestExit}
          accessibilityRole="button"
          accessibilityLabel={t('common:close', { ns: 'common' })}
        >
          <FontAwesome name="times" size={23} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={[styles.progressTrack, { backgroundColor: withAlpha(accent, 0.18) }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: accent },
            ]}
          />
        </View>
        <View style={styles.lives} accessibilityLabel={`${t('warriorPath.lives')}: ${lives}`}>
          {[0, 1, 2].map((drop) => (
            <FontAwesome
              key={drop}
              name="tint"
              size={18}
              color={drop < lives ? colors.error.main : colors.text.disabled}
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
          <Card style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <View
                style={[
                  styles.missionMedallion,
                  {
                    backgroundColor: withAlpha(accent, 0.14),
                    borderColor: withAlpha(accent, 0.3),
                  },
                ]}
              >
                <FontAwesome name={world.icon} size={18} color={accent} />
              </View>
              <View style={styles.missionHeaderCopy}>
                <ThemedText style={[styles.missionOverline, { color: accent }]}>
                  {t('warriorPath.world', { number: worldNumber })} · {t('warriorPath.level', { number: level })}
                </ThemedText>
                <ThemedText type="h6" style={styles.missionTitle}>
                  {missionTitle}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.videoContainer, { backgroundColor: '#000000' }]}>
              <VideoView
                player={player}
                style={styles.video}
                nativeControls
                contentFit="contain"
                requiresLinearPlayback
                playsInline
              />
              {videoLoading && (
                <View style={[styles.videoOverlay, { backgroundColor: colors.overlay }]}>
                  <ActivityIndicator size="large" color={colors.onAccent} />
                </View>
              )}
              {videoError && (
                <View style={[styles.videoOverlay, { backgroundColor: colors.overlay }]}>
                  <ThemedText style={[styles.videoErrorText, { color: colors.onAccent }]}>
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
              icon={
                <FontAwesome
                  name="arrow-right"
                  size={16}
                  color={colors.primary.contrastText}
                />
              }
            />
          </Card>
        ) : currentQuestion ? (
          <View style={styles.quizSection}>
            <View style={styles.quizTopline}>
              <View style={[styles.questionPill, { backgroundColor: withAlpha(accent, 0.14) }]}>
                <ThemedText style={[styles.questionPillText, { color: accent }]}>
                  {t('warriorPath.question', {
                    current: questionIndex + 1,
                    total: lesson.preguntas.length,
                  })}
                </ThemedText>
              </View>
              <ThemedText muted numberOfLines={1} style={styles.quizMissionTitle}>
                {missionTitle}
              </ThemedText>
            </View>

            <Card style={styles.questionCard}>
              <ThemedText type="defaultSemiBold" style={styles.questionText}>
                {currentQuestion.enunciado}
              </ThemedText>

              {i18n.resolvedLanguage !== 'es' && (
                <ThemedText muted style={styles.languageNotice}>
                  {t('warriorPath.lessonContentSpanishNotice')}
                </ThemedText>
              )}

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
                        ? accent
                        : colors.border;
                  const optionBackground = revealed && correctAnswer
                    ? withAlpha(colors.success.main, 0.1)
                    : revealed && selected
                      ? withAlpha(colors.error.main, 0.1)
                      : selected
                        ? withAlpha(accent, 0.1)
                        : colors.inputBackground;
                  const markerFilled =
                    selected || (revealed && correctAnswer);
                  const markerColor = revealed && correctAnswer
                    ? colors.success.main
                    : revealed && selected
                      ? colors.error.main
                      : accent;
                  const letter = String.fromCharCode(65 + index);

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
                          backgroundColor: optionBackground,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.optionMarker,
                          {
                            borderColor: optionBorder,
                            backgroundColor: markerFilled ? markerColor : 'transparent',
                          },
                        ]}
                      >
                        {markerFilled ? (
                          <FontAwesome
                            name="check"
                            size={13}
                            color={colors.text.inverse}
                          />
                        ) : (
                          <ThemedText style={[styles.optionLetter, { color: optionBorder }]}>
                            {letter}
                          </ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.optionText}>{option}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showHint && (
                <View
                  style={[
                    styles.hintCard,
                    {
                      backgroundColor: withAlpha(colors.warning.main, 0.1),
                      borderColor: withAlpha(colors.warning.main, 0.24),
                    },
                  ]}
                >
                  <FontAwesome name="lightbulb-o" size={18} color={colors.warning.main} />
                  <ThemedText style={styles.hintText}>{t('warriorPath.hintText')}</ThemedText>
                </View>
              )}
            </Card>

            {answerState !== 'idle' && (
              <Card
                style={[
                  styles.feedback,
                  {
                    backgroundColor: withAlpha(
                      answerState === 'correct' ? colors.success.main : colors.error.main,
                      0.08
                    ),
                    borderColor: withAlpha(
                      answerState === 'correct' ? colors.success.main : colors.error.main,
                      0.3
                    ),
                  },
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
                        size={22}
                        color={answerState === 'correct' ? colors.success.main : colors.error.main}
                      />
                      <ThemedText
                        type="defaultSemiBold"
                        style={{
                          color: answerState === 'correct' ? colors.success.main : colors.error.main,
                          flex: 1,
                        }}
                      >
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
              <Card
                style={[
                  styles.errorCard,
                  {
                    backgroundColor: withAlpha(colors.error.main, 0.08),
                    borderColor: withAlpha(colors.error.main, 0.3),
                  },
                ]}
              >
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  closeButton: { width: 32, alignItems: 'center' },
  progressTrack: { flex: 1, height: 10, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  lives: { flexDirection: 'row', gap: 4 },

  content: { flexGrow: 1, padding: 16, paddingBottom: 32 },

  missionCard: { padding: 16, gap: 14, marginTop: 4 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  missionMedallion: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionHeaderCopy: { flex: 1, minWidth: 0 },
  missionOverline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  missionTitle: { fontSize: 17, lineHeight: 22, marginTop: 2 },
  videoContainer: { width: '100%', aspectRatio: 16 / 9, borderRadius: 14, overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  videoErrorText: { textAlign: 'center' },
  videoCaption: { textAlign: 'center', fontSize: 12 },

  quizSection: { paddingBottom: 20 },
  quizTopline: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  questionPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9 },
  questionPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  quizMissionTitle: { flex: 1, fontSize: 12, textAlign: 'right' },
  questionCard: { padding: 16 },
  questionText: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 16 },
  languageNotice: { fontSize: 12, textAlign: 'center', marginBottom: 12 },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  optionMarker: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: { fontSize: 12, fontWeight: '700' },
  optionText: { flex: 1, fontSize: 14, lineHeight: 21 },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintText: { flex: 1, fontSize: 13, lineHeight: 20 },

  feedback: { padding: 14, marginTop: 14, borderWidth: 1 },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedbackMascot: { width: 58, height: 66 },
  feedbackCopy: { flex: 1, gap: 6 },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorCard: { padding: 14, marginTop: 14, borderWidth: 1 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionButton: { flex: 1 },

  dialog: { gap: 14, paddingBottom: 18 },
  dialogMascot: { width: 112, height: 112, alignSelf: 'center' },
  dialogTitle: { textAlign: 'center' },
  dialogDescription: { textAlign: 'center', marginBottom: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
});
