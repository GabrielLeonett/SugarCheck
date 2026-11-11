import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { DatePickerField } from '@/components/DatePicker';
import { FormInput } from '@/components/FormInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AVATARS, AVATAR_NAMES } from '@/constants/avatars';
import { GLUCO_GESTURES } from '@/constants/gestures';
import { CONTACT_RELATIONSHIPS } from '@/src/constants/contactRelationships';
import { useTheme } from '@/contexts/ThemeContext';
import { createGuestId, useGuestStore, type GuestProfile } from '@/src/stores/guestStore';
import { showErrorAlert } from '@/src/stores/systemAlertStore';

const LAST_STEP = 10;

export default function GuestOnboardingScreen() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const startGuest = useGuestStore((state) => state.startGuest);

  const [step, setStep] = useState(0);
  const [dialogChars, setDialogChars] = useState(0);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState('');
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1));
  const [birthDateSelected, setBirthDateSelected] = useState(false);
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const [hypo, setHypo] = useState('');
  const [hyper, setHyper] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const dialogue = t(`auth:guestDialogue${step}`);

  useEffect(() => {
    setDialogChars(0);
    const timer = setInterval(() => {
      setDialogChars((current) => {
        if (current >= dialogue.length) {
          clearInterval(timer);
          return dialogue.length;
        }
        return current + 1;
      });
    }, 22);
    return () => clearInterval(timer);
  }, [dialogue]);

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (name.trim().length < 3 || name.trim().length > 50) {
          showErrorAlert(t('auth:guestInvalidName'));
          return false;
        }
        break;
      case 1:
        if (!Number.isFinite(Number(weight)) || Number(weight) <= 0 || Number(weight) >= 700) {
          showErrorAlert(t('auth:guestInvalidWeight'));
          return false;
        }
        break;
      case 2:
        if (!Number.isFinite(Number(height)) || Number(height) <= 0 || Number(height) >= 280) {
          showErrorAlert(t('auth:guestInvalidHeight'));
          return false;
        }
        break;
      case 3:
        if (!sex) {
          showErrorAlert(t('auth:guestRequired'));
          return false;
        }
        break;
      case 4:
        if (!birthDateSelected || birthDate.getTime() > Date.now()) {
          showErrorAlert(t('auth:guestInvalidBirthDate'));
          return false;
        }
        break;
      case 5:
        if (contactName.trim().length < 3 || contactName.trim().length > 50) {
          showErrorAlert(t('auth:guestInvalidContactName'));
          return false;
        }
        break;
      case 6:
        if (!relationship) {
          showErrorAlert(t('auth:guestRequired'));
          return false;
        }
        break;
      case 7:
        if (!/^\+?\d{7,15}$/.test(phone.trim().replace(/[\s()-]/g, ''))) {
          showErrorAlert(t('auth:guestInvalidPhone'));
          return false;
        }
        break;
      case 8:
        if (!goal.trim()) {
          showErrorAlert(t('auth:guestRequired'));
          return false;
        }
        if (goal.trim().length > 200) {
          showErrorAlert(t('auth:guestInvalidGoal'));
          return false;
        }
        break;
      case 9: {
        const hypoValue = Number(hypo);
        const hyperValue = Number(hyper);
        if (!Number.isFinite(hypoValue) || !Number.isFinite(hyperValue) ||
          hypoValue <= 0 || hyperValue <= hypoValue) {
          showErrorAlert(t('auth:guestInvalidRange'));
          return false;
        }
        break;
      }
      case 10:
        if (!avatar) {
          showErrorAlert(t('auth:guestRequired'));
          return false;
        }
        break;
    }

    return true;
  };

  const finishOnboarding = async () => {
    const weightValue = Number(weight);
    const heightValue = Number(height);
    const profile: GuestProfile = {
      id: createGuestId(),
      name: name.trim(),
      weight: weightValue,
      height: heightValue,
      sex,
      birthDate: birthDate.toISOString(),
      emergencyContact: {
        id: createGuestId(),
        name: contactName.trim(),
        relationship,
        phone: phone.trim(),
      },
      goal: goal.trim(),
      glucoseRange: { hypo: Number(hypo), hyper: Number(hyper) },
      avatar,
      createdAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await startGuest(profile);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('No se pudo guardar el perfil invitado:', error);
      showErrorAlert(t('auth:guestSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    if (!validateStep()) return;
    if (step < LAST_STEP) {
      setStep((current) => current + 1);
      return;
    }
    await finishOnboarding();
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((current) => current - 1);
  };

  const renderQuestion = () => {
    switch (step) {
      case 0:
        return (
          <FormInput
            label={t('auth:fullName')}
            value={name}
            onChangeText={setName}
            placeholder={t('auth:yourName')}
            autoCapitalize="words"
          />
        );
      case 1:
        return (
          <FormInput
            label={t('auth:weight')}
            value={weight}
            onChangeText={setWeight}
            placeholder="Ej: 70"
            keyboardType="decimal-pad"
          />
        );
      case 2:
        return (
          <FormInput
            label={t('auth:height')}
            value={height}
            onChangeText={setHeight}
            placeholder="Ej: 170"
            keyboardType="decimal-pad"
          />
        );
      case 3:
        return (
          <View style={styles.options}>
            {[
              { value: 'masculino', label: t('common:male') },
              { value: 'femenino', label: t('common:female') },
              { value: 'otro', label: t('auth:otherSex') },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSex(option.value)}
                style={[
                  styles.option,
                  {
                    borderColor: sex === option.value ? colors.primary.main : colors.divider,
                    backgroundColor: sex === option.value ? colors.primary[50] : colors.background.paper,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: sex === option.value }}
              >
                <ThemedText>{option.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 4:
        return (
          <DatePickerField
            label={t('common:dateOfBirth')}
            value={birthDate}
            onChange={(date) => {
              setBirthDate(date);
              setBirthDateSelected(true);
            }}
          />
        );
      case 5:
        return (
          <FormInput
            label={t('auth:contactName')}
            value={contactName}
            onChangeText={setContactName}
            placeholder={t('auth:guestContactHint')}
            autoCapitalize="words"
          />
        );
      case 6:
        return (
          <View style={styles.relationOptions}>
            {CONTACT_RELATIONSHIPS.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setRelationship(value)}
                style={[
                  styles.relationOption,
                  {
                    borderColor: relationship === value ? colors.primary.main : colors.divider,
                    backgroundColor: relationship === value ? colors.primary[50] : colors.background.paper,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: relationship === value }}
              >
                <ThemedText style={styles.relationLabel}>
                  {t(`auth:contact${value[0].toUpperCase()}${value.slice(1)}`)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 7:
        return (
          <FormInput
            label={t('auth:contactPhone')}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 555 123 4567"
            keyboardType="phone-pad"
          />
        );
      case 8:
        return (
          <FormInput
            label={t('auth:personalGoal')}
            value={goal}
            onChangeText={setGoal}
            placeholder={t('auth:personalGoalPrompt')}
          />
        );
      case 9:
        return (
          <>
            <ThemedText muted style={styles.helper}>{t('auth:guestGlucoseRangeHint')}</ThemedText>
            <View style={styles.row}>
              <View style={styles.half}>
                <FormInput
                  label={t('auth:minimumGlucose')}
                  value={hypo}
                  onChangeText={setHypo}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.half}>
                <FormInput
                  label={t('auth:maximumGlucose')}
                  value={hyper}
                  onChangeText={setHyper}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </>
        );
      case 10:
        return (
          <View style={styles.avatarGrid}>
            {AVATAR_NAMES.map((avatarName) => {
              const selected = avatar === avatarName;
              return (
                <TouchableOpacity
                  key={avatarName}
                  onPress={() => setAvatar(avatarName)}
                  style={[
                    styles.avatarOption,
                    { borderColor: selected ? colors.primary.main : colors.divider },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${t('auth:chooseCharacter')}: ${avatarName}`}
                >
                  <Image source={AVATARS[avatarName]} style={styles.avatar} resizeMode="contain" />
                  <ThemedText style={styles.avatarLabel}>{avatarName.replace('Gluco', '')}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel={t('common:back')}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText muted style={styles.stepCount}>
            {t('auth:guestStepCount', { current: step + 1, total: LAST_STEP + 1 })}
          </ThemedText>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.divider }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary.main, width: `${((step + 1) / (LAST_STEP + 1)) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.scene}>
          <Image
            source={GLUCO_GESTURES.saludoAlegre}
            style={styles.mascot}
            resizeMode="contain"
          />
          <View style={styles.dialogColumn}>
            <View style={[styles.nameTag, { backgroundColor: colors.primary.main }]}>
              <ThemedText style={[styles.nameTagText, { color: colors.primary.contrastText }]}>
                Gluco
              </ThemedText>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setDialogChars(dialogue.length)}
              accessibilityRole="button"
              accessibilityLabel={t('auth:guestSkipDialogue')}
            >
              <View
                style={[
                  styles.dialog,
                  {
                    backgroundColor: colors.background.paper,
                    borderColor: colors.primary[100],
                    shadowColor: colors.text.primary,
                  },
                ]}
              >
                <ThemedText style={[styles.dialogText, { color: colors.text.primary }]}>
                  {dialogue.slice(0, dialogChars)}
                  {dialogChars < dialogue.length ? '▌' : ''}
                </ThemedText>
                {dialogChars === dialogue.length && (
                  <ThemedText style={[styles.dialogPrompt, { color: colors.primary.main }]}>▼</ThemedText>
                )}
                <View
                  style={[
                    styles.dialogTail,
                    {
                      backgroundColor: colors.background.paper,
                      borderColor: colors.primary[100],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {dialogChars === dialogue.length ? (
          <>
            <Card style={styles.questionCard}>
              <ThemedText type="defaultSemiBold" style={[styles.questionTitle, { color: colors.primary.main }]}>
                {t(`auth:guestQuestion${step}`)}
              </ThemedText>
              {renderQuestion()}
            </Card>

            <Button
              title={step === LAST_STEP ? t('auth:guestSave') : t('auth:guestNext')}
              onPress={handleContinue}
              loading={saving}
              style={styles.submit}
            />
          </>
        ) : null}
        <ThemedText muted style={styles.footer}>{t('auth:guestDataNotice')}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, paddingVertical: 8 },
  stepCount: { fontSize: 13 },
  progressTrack: { height: 7, borderRadius: 4, marginBottom: 22, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  scene: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 22 },
  mascot: { width: 104, height: 132 },
  dialogColumn: { flex: 1, paddingTop: 12 },
  nameTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 6,
    marginLeft: 12,
    marginBottom: 7,
    zIndex: 1,
    borderRadius: 16,
    elevation: 2,
  },
  nameTagText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '700',
  },
  dialog: {
    position: 'relative',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderRadius: 20,
    minHeight: 96,
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dialogText: { fontSize: 15, lineHeight: 23, fontFamily: 'Poppins-Regular' },
  dialogPrompt: { textAlign: 'right', fontSize: 12, marginTop: 4 },
  dialogTail: {
    position: 'absolute',
    left: 20,
    bottom: -7,
    width: 12,
    height: 12,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  questionCard: { padding: 18, minHeight: 150, justifyContent: 'center' },
  questionTitle: { fontSize: 17, marginBottom: 16 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 10, alignItems: 'center' },
  relationOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relationOption: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  relationLabel: { fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  helper: { fontSize: 12, marginBottom: 14, lineHeight: 18 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  avatarOption: { width: 88, minHeight: 100, borderWidth: 2, borderRadius: 12, padding: 6, alignItems: 'center' },
  avatar: { width: 64, height: 64 },
  avatarLabel: { fontSize: 11 },
  submit: { marginTop: 18 },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 12, lineHeight: 16 },
});
