import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { FormInput } from '@/components/FormInput';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DatePickerField } from '@/components/DatePicker';
import { AVATARS, AVATAR_NAMES } from '@/constants/avatars';
import { CONTACT_RELATIONSHIPS } from '@/src/constants/contactRelationships';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { useGuestStore } from '@/src/stores/guestStore';
import { userApi } from '@/src/apis/user';
import { contactEmergenceApi } from '@/src/apis/contact-emergence';
import type {
  BasalSchemaItem,
  ContactEmergenceData,
  CorrectionSchemaItem,
} from '@/src/types';
import { usePreferenceConfig } from '@/src/stores/preferenceStore';
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '@/src/stores/systemAlertStore';

export default function PerfilScreen() {
  const { t } = useTranslation(['profile', 'common', 'auth']);
  const { colors, isDark, mode, toggleTheme, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const guestProfile = useGuestStore((s) => s.profile);
  const isGuestMode = useGuestStore((s) => s.isGuestMode);
  const updateGuestProfile = useGuestStore((s) => s.updateProfile);
  const saveGuestRecord = useGuestStore((s) => s.saveRecord);
  const setPendingImport = useGuestStore((s) => s.setPendingImport);
  const { preference, load: loadPrefs, save: savePrefs } = usePreferenceConfig();

  const [contacts, setContacts] = useState<ContactEmergenceData[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('GlucoAstro');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactEmergenceData | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', parentesco: '', telefono: '' });
  const [personalData, setPersonalData] = useState({
    name: authUser?.name || guestProfile?.name || '',
    email: authUser?.email || '',
    sexo: authUser?.sexo || guestProfile?.sex || '',
    fechaNacimiento: authUser?.fechaNacimiento
      ? new Date(authUser.fechaNacimiento)
      : guestProfile?.birthDate
        ? new Date(guestProfile.birthDate)
        : new Date(2000, 0, 1),
    weight: guestProfile?.weight.toString() ?? '',
    height: guestProfile?.height.toString() ?? '',
    goal: guestProfile?.goal ?? '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [schemaModal, setSchemaModal] = useState<'correction' | 'basal' | null>(null);
  const [correctionSchemas, setCorrectionSchemas] = useState<CorrectionSchemaItem[]>([]);
  const [basalSchemas, setBasalSchemas] = useState<BasalSchemaItem[]>([]);
  const [schemaForm, setSchemaForm] = useState({ rangeMin: '', rangeMax: '', dose: '', injectionTime: '' });
  const [editingSchemaIndex, setEditingSchemaIndex] = useState<number | null>(null);

  const [prefForm, setPrefForm] = useState({
    hypo: preference?.thresholds?.hypo?.toString() || '70',
    hiper: preference?.thresholds?.hiper?.toString() || '180',
  });

  const loadContacts = useCallback(async () => {
    try {
      const data = await contactEmergenceApi.getAll();
      setContacts(Array.isArray(data) ? data : []);
    } catch {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    loadContacts();
    loadPrefs();
  }, [loadContacts, loadPrefs]);

  useEffect(() => {
    if (preference) {
      setSelectedAvatar(
        AVATARS[preference.profileImg] ? preference.profileImg : 'GlucoAstro'
      );
      setPrefForm({
        hypo: preference.thresholds?.hypo?.toString() || '70',
        hiper: preference.thresholds?.hiper?.toString() || '180',
      });
      setCorrectionSchemas(preference.correctionSchemas ?? []);
      setBasalSchemas(preference.basalSchemas ?? []);
    }
  }, [preference]);

  const handleSaveAvatar = async () => {
    if (!preference) {
      showErrorAlert(t('profile:clinicalSaveError'));
      return;
    }

    setSavingAvatar(true);
    try {
      await savePrefs({ ...preference, profileImg: selectedAvatar });
      setShowAvatarModal(false);
      showSuccessAlert(t('profile:avatarUpdated'));
    } catch {
      showErrorAlert(t('profile:avatarUpdateError'));
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSavePersonal = async () => {
    if (isGuestMode && guestProfile) {
      const weight = Number(personalData.weight);
      const height = Number(personalData.height);
      if (personalData.name.trim().length < 3 || personalData.name.trim().length > 50 ||
        !personalData.sexo || !personalData.goal.trim() || personalData.goal.trim().length > 200 ||
        !Number.isFinite(weight) || weight <= 0 || weight >= 700 ||
        !Number.isFinite(height) || height <= 0 || height >= 280 ||
        personalData.fechaNacimiento.getTime() > Date.now()) {
        showErrorAlert(t('auth:guestRequired'));
        return;
      }

      setSavingPersonal(true);
      try {
        await updateGuestProfile({
          ...guestProfile,
          name: personalData.name.trim(),
          sex: personalData.sexo,
          birthDate: personalData.fechaNacimiento.toISOString(),
          weight,
          height,
          goal: personalData.goal.trim(),
        });
        const imc = weight / ((height / 100) ** 2);
        const createdAt = new Date().toISOString();
        await saveGuestRecord('physical', {
          id: guestProfile.id,
          peso: weight,
          altura: height,
          imcValue: Number(imc.toFixed(1)),
          categoria: imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad',
          fecha: createdAt,
          createdAt,
        });
        showSuccessAlert(t('profile:personalUpdated'));
      } catch {
        showErrorAlert(t('profile:personalUpdateError'));
      } finally {
        setSavingPersonal(false);
      }
      return;
    }

    if (!authUser?.id) return;
    if (!personalData.name.trim() || !personalData.email.trim()) {
      showErrorAlert(t('profile:completeNameEmail'));
      return;
    }

    setSavingPersonal(true);
    try {
      await userApi.update(authUser.id, {
        name: personalData.name.trim(),
        email: personalData.email.trim(),
        sexo: personalData.sexo,
        fechaNacimiento: personalData.fechaNacimiento.toISOString(),
      });
      await useAuthStore.getState().refresh();
      showSuccessAlert(t('profile:personalUpdated'));
    } catch {
      showErrorAlert(t('profile:personalUpdateError'));
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showErrorAlert(t('profile:passwordRequired'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showErrorAlert(t('auth:passwordsMismatch'));
      return;
    }

    setSavingPassword(true);
    try {
      await userApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccessAlert(t('profile:passwordUpdated'));
    } catch {
      showErrorAlert(t('profile:passwordUpdateError'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveClinicalPreferences = async () => {
    const hypo = Number(prefForm.hypo);
    const hiper = Number(prefForm.hiper);
    if (!Number.isFinite(hypo) || !Number.isFinite(hiper) || hypo <= 0 || hiper <= hypo) {
      showErrorAlert(t('profile:invalidRanges'));
      return;
    }
    if (!preference) {
      showErrorAlert(t('profile:clinicalSaveError'));
      return;
    }

    setSavingPreferences(true);
    try {
      await savePrefs({ ...preference, thresholds: { hypo, hiper } });
      showSuccessAlert(t('profile:clinicalSaved'));
    } catch {
      showErrorAlert(t('profile:clinicalSaveError'));
    } finally {
      setSavingPreferences(false);
    }
  };

  const openSchemaModal = (type: 'correction' | 'basal') => {
    setSchemaForm({ rangeMin: '', rangeMax: '', dose: '', injectionTime: '' });
    setEditingSchemaIndex(null);
    setSchemaModal(type);
  };

  const addSchemaItem = () => {
    const dose = Number(schemaForm.dose);
    if (!Number.isFinite(dose) || dose <= 0) {
      showErrorAlert(t('profile:invalidDose'));
      return;
    }

    if (schemaModal === 'correction') {
      const rangeMin = Number(schemaForm.rangeMin);
      const rangeMax = Number(schemaForm.rangeMax);
      if (!Number.isFinite(rangeMin) || !Number.isFinite(rangeMax) || rangeMin < 0 || rangeMax <= rangeMin) {
        showErrorAlert(t('profile:invalidRange'));
        return;
      }
      const item = { rangeMin, rangeMax, dose };
      setCorrectionSchemas((items) => editingSchemaIndex === null
        ? [...items, item]
        : items.map((current, index) => index === editingSchemaIndex ? item : current));
    } else if (schemaModal === 'basal') {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(schemaForm.injectionTime)) {
        showErrorAlert(t('profile:invalidTime'));
        return;
      }
      const item = { injectionTime: schemaForm.injectionTime, dose };
      setBasalSchemas((items) => editingSchemaIndex === null
        ? [...items, item]
        : items.map((current, index) => index === editingSchemaIndex ? item : current));
    }
    setSchemaForm({ rangeMin: '', rangeMax: '', dose: '', injectionTime: '' });
    setEditingSchemaIndex(null);
  };

  const editSchemaItem = (index: number) => {
    if (schemaModal === 'correction') {
      const item = correctionSchemas[index];
      setSchemaForm({
        rangeMin: String(item.rangeMin),
        rangeMax: String(item.rangeMax),
        dose: String(item.dose),
        injectionTime: '',
      });
    } else {
      const item = basalSchemas[index];
      setSchemaForm({
        rangeMin: '',
        rangeMax: '',
        dose: String(item.dose),
        injectionTime: item.injectionTime,
      });
    }
    setEditingSchemaIndex(index);
  };

  const deleteSchemaItem = (index: number) => {
    if (schemaModal === 'correction') {
      setCorrectionSchemas((items) => items.filter((_, itemIndex) => itemIndex !== index));
    } else {
      setBasalSchemas((items) => items.filter((_, itemIndex) => itemIndex !== index));
    }
    if (editingSchemaIndex === index) {
      setSchemaForm({ rangeMin: '', rangeMax: '', dose: '', injectionTime: '' });
      setEditingSchemaIndex(null);
    }
  };

  const renderSchemaRow = (label: string, index: number) => (
    <View
      key={`${index}-${schemaModal}`}
      style={[styles.schemaItem, { borderBottomColor: colors.divider }]}
    >
      <ThemedText style={styles.schemaItemText}>{label}</ThemedText>
      <TouchableOpacity onPress={() => editSchemaItem(index)} accessibilityLabel={t('common:edit')}>
        <FontAwesome name="edit" size={18} color={colors.primary.main} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteSchemaItem(index)} accessibilityLabel={t('common:delete')}>
        <FontAwesome name="trash" size={18} color={colors.error.main} />
      </TouchableOpacity>
    </View>
  );

  const handleSaveSchemas = async () => {
    if (!preference || !schemaModal) {
      showErrorAlert(t('profile:clinicalSaveError'));
      return;
    }
    setSavingPreferences(true);
    try {
      await savePrefs({
        ...preference,
        correctionSchemas,
        basalSchemas,
      });
      setSchemaModal(null);
      showSuccessAlert(t('profile:configurationSaved'));
    } catch {
      showErrorAlert(t('profile:configurationSaveError'));
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleSaveContact = async () => {
    if (contactForm.name.trim().length < 3 || contactForm.name.trim().length > 50 ||
      !CONTACT_RELATIONSHIPS.includes(contactForm.parentesco as typeof CONTACT_RELATIONSHIPS[number]) ||
      (contactForm.telefono.trim() &&
        !/^\+?\d{7,15}$/.test(contactForm.telefono.trim().replace(/[\s()-]/g, ''))) ||
      (isGuestMode && !contactForm.telefono.trim())) {
      showErrorAlert(t('profile:contactSaveError'));
      return;
    }

    try {
      if (editingContact) {
        await contactEmergenceApi.update(editingContact.id, contactForm);
      } else {
        await contactEmergenceApi.create(contactForm);
      }
      setShowContactModal(false);
      setEditingContact(null);
      setContactForm({ name: '', parentesco: '', telefono: '' });
      loadContacts();
    } catch {
      showErrorAlert(t('profile:contactSaveError'));
    }
  };

  const handleDeleteContact = (id: string) => {
    showConfirmAlert({
      title: t('profile:deleteContactTitle'),
      description: t('profile:sure'),
      confirmText: t('common:delete'),
      destructive: true,
      onConfirm: async () => {
        try {
          await contactEmergenceApi.delete(id);
          loadContacts();
        } catch {
          showErrorAlert(t('profile:contactDeleted'));
        }
      },
    });
  };

  const handleDeleteAccount = () => {
    showConfirmAlert({
      title: t('profile:deleteAccount'),
      description: t('profile:deleteAccountWarning'),
      confirmText: t('common:delete'),
      destructive: true,
      onConfirm: async () => {
        try {
          if (authUser?.id) await userApi.delete(authUser.id);
          await logout();
          router.push('/auth/login');
        } catch {
          showErrorAlert(t('profile:deleteAccountError'));
        }
      },
    });
  };

  const handleLogout = () => {
    showConfirmAlert({
      title: t('profile:logout'),
      description: t('profile:logoutConfirm'),
      confirmText: t('profile:logout'),
      destructive: true,
      onConfirm: async () => {
        try {
          await logout();
          router.push('/auth/login');
        } catch {
          showErrorAlert(t('profile:logoutError'));
        }
      },
    });
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionHeader}>
      <FontAwesome name={icon as any} size={18} color={colors.primary.main} />
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.headerTitle, { paddingTop: insets.top + 16 }]}>
        <ThemedText type="title" style={{ fontSize: 24 }}>
          {t('profile:title')}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={[styles.avatar, { borderColor: colors.primary.main }]}
            onPress={() => {
              setSelectedAvatar(
                preference && AVATARS[preference.profileImg]
                  ? preference.profileImg
                  : 'GlucoAstro'
              );
              setShowAvatarModal(true);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('profile:changeAvatar')}
          >
            <Image
              source={AVATARS[preference?.profileImg ?? ''] ?? AVATARS.GlucoAstro}
              style={styles.avatarImage}
              resizeMode="cover"
            />
            <View style={[styles.avatarEdit, { backgroundColor: colors.primary.main }]}>
              <FontAwesome name="edit" size={14} color={colors.primary.contrastText} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedAvatar(
                preference && AVATARS[preference.profileImg]
                  ? preference.profileImg
                  : 'GlucoAstro'
              );
              setShowAvatarModal(true);
            }}
            activeOpacity={0.7}
          >
            <ThemedText muted style={styles.changeAvatarText}>
              {t('profile:changeAvatar')}
            </ThemedText>
          </TouchableOpacity>
          <ThemedText type="h6" style={styles.userName}>
            {authUser?.name || guestProfile?.name}
          </ThemedText>
          <ThemedText muted>{authUser?.email || (isGuestMode ? t('auth:continueGuest') : '')}</ThemedText>
        </View>

        <Card style={styles.card}>
          <SectionHeader title={t('common:appearance')} icon="adjust" />
          <View style={styles.appearanceRow}>
            <View style={styles.appearanceInfo}>
              <FontAwesome
                name={isDark ? 'moon-o' : 'sun-o'}
                size={20}
                color={colors.primary.main}
              />
              <View style={styles.appearanceText}>
                <ThemedText type="defaultSemiBold">
                  {isDark ? t('common:darkTheme') : t('common:lightTheme')}
                </ThemedText>
                <ThemedText muted style={styles.appearanceHint}>
                  {mode === 'system' ? t('common:systemFollowing') : t('common:savedPreference')}
                </ThemedText>
              </View>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.divider, true: colors.primary.main }}
              thumbColor={colors.background.paper}
              ios_backgroundColor={colors.divider}
            />
          </View>

          {mode !== 'system' && (
            <TouchableOpacity
              onPress={() => setMode('system')}
              style={styles.systemThemeButton}
              activeOpacity={0.7}
            >
              <ThemedText style={{ color: colors.primary.main, fontSize: 13 }}>
                {t('common:followSystem')}
              </ThemedText>
            </TouchableOpacity>
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title={t('common:accessibility')} icon="universal-access" />
          <ThemedText muted style={styles.clinicalDescription}>
            {t('common:languageDescription')}
          </ThemedText>
          <LanguageSelector />
        </Card>

        <Card style={styles.card}>
          <SectionHeader title={t('profile:personal')} icon="user" />
          <FormInput
            label={t('common:name')}
            value={personalData.name}
            onChangeText={(value) => setPersonalData((previous) => ({ ...previous, name: value }))}
            autoCapitalize="words"
          />
          <DatePickerField
            label={t('common:dateOfBirth')}
            value={personalData.fechaNacimiento}
            onChange={(fechaNacimiento) => setPersonalData((previous) => ({ ...previous, fechaNacimiento }))}
          />
          {isGuestMode ? (
            <>
              <FormInput
                label={t('auth:weight')}
                value={personalData.weight}
                onChangeText={(weight) => setPersonalData((previous) => ({ ...previous, weight }))}
                keyboardType="decimal-pad"
              />
              <FormInput
                label={t('auth:height')}
                value={personalData.height}
                onChangeText={(height) => setPersonalData((previous) => ({ ...previous, height }))}
                keyboardType="decimal-pad"
              />
              <FormInput
                label={t('auth:personalGoal')}
                value={personalData.goal}
                onChangeText={(goal) => setPersonalData((previous) => ({ ...previous, goal }))}
              />
            </>
          ) : (
            <FormInput
              label={t('common:email')}
              value={personalData.email}
              onChangeText={(value) => setPersonalData((previous) => ({ ...previous, email: value }))}
              keyboardType="email-address"
            />
          )}
          <ThemedText muted style={styles.sexLabel}>{t('common:sex')}</ThemedText>
          <View style={styles.sexOptions}>
            {[
              { value: 'masculino', label: t('common:male') },
              { value: 'femenino', label: t('common:female') },
              ...(isGuestMode ? [{ value: 'otro', label: t('auth:otherSex') }] : []),
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setPersonalData((previous) => ({ ...previous, sexo: option.value }))}
                style={[
                  styles.sexOption,
                  {
                    borderColor: personalData.sexo === option.value ? colors.primary.main : colors.border,
                    backgroundColor: personalData.sexo === option.value ? colors.primary[50] : colors.background.paper,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: personalData.sexo === option.value }}
              >
                <ThemedText>{option.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title={t('common:saveChanges')}
            onPress={handleSavePersonal}
            loading={savingPersonal}
            style={styles.inlineButton}
          />
        </Card>

        {!isGuestMode && <Card style={styles.card}>
          <SectionHeader title={t('profile:passwordTitle')} icon="lock" />
          <FormInput
            label={t('profile:currentPassword')}
            value={passwordForm.currentPassword}
            onChangeText={(currentPassword) => setPasswordForm((previous) => ({ ...previous, currentPassword }))}
            secureTextEntry
          />
          <FormInput
            label={t('profile:newPassword')}
            value={passwordForm.newPassword}
            onChangeText={(newPassword) => setPasswordForm((previous) => ({ ...previous, newPassword }))}
            secureTextEntry
          />
          <FormInput
            label={t('profile:confirmNewPassword')}
            value={passwordForm.confirmPassword}
            onChangeText={(confirmPassword) => setPasswordForm((previous) => ({ ...previous, confirmPassword }))}
            secureTextEntry
          />
          <Button
            title={t('profile:updatePassword')}
            onPress={handleChangePassword}
            loading={savingPassword}
            style={styles.inlineButton}
          />
        </Card>}

        <Card style={styles.card}>
          <View style={styles.contactHeader}>
            <SectionHeader title={t('profile:contacts')} icon="phone" />
            <TouchableOpacity
              onPress={() => {
                setEditingContact(null);
                setContactForm({ name: '', parentesco: '', telefono: '' });
                setShowContactModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('profile:addContact')}
            >
              <FontAwesome name="plus-circle" size={24} color={colors.primary.main} />
            </TouchableOpacity>
          </View>

          {contacts.length === 0 ? (
            <ThemedText muted style={styles.emptyMessage}>
              {t('profile:noContacts')}
            </ThemedText>
          ) : (
            contacts.map((contact) => (
              <View
                key={contact.id}
                style={[styles.contactItem, { borderBottomColor: colors.divider }]}
              >
                <View style={styles.contactContent}>
                  <ThemedText type="defaultSemiBold">{contact.name}</ThemedText>
                  <ThemedText muted style={styles.contactDetail}>
                    {contact.parentesco}
                    {contact.telefono ? ` - ${contact.telefono}` : ''}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEditingContact(contact);
                    setContactForm({
                      name: contact.name,
                      parentesco: contact.parentesco,
                      telefono: contact.telefono || '',
                    });
                    setShowContactModal(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common:edit')}
                >
                  <FontAwesome
                    name="edit"
                    size={18}
                    color={colors.primary.main}
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
                {!isGuestMode && (
                  <TouchableOpacity
                    onPress={() => handleDeleteContact(contact.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('common:delete')}
                  >
                    <FontAwesome name="trash" size={18} color={colors.error.main} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title={t('profile:clinical')} icon="heartbeat" />
          <View style={styles.prefRow}>
            <View style={styles.prefField}>
              <FormInput
                label={t('profile:hypoLimit')}
                value={prefForm.hypo}
                onChangeText={(value) => setPrefForm((previous) => ({ ...previous, hypo: value }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.prefGap} />
            <View style={styles.prefField}>
              <FormInput
                label={t('profile:hyperLimit')}
                value={prefForm.hiper}
                onChangeText={(value) => setPrefForm((previous) => ({ ...previous, hiper: value }))}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Button
            title={t('profile:saveGlucoseRanges')}
            onPress={handleSaveClinicalPreferences}
            loading={savingPreferences}
            style={styles.inlineButton}
          />
          <View style={styles.buttonGap} />
          <ThemedText type="defaultSemiBold" style={styles.clinicalSubheading}>
            {t('profile:correction')}
          </ThemedText>
          <ThemedText muted style={styles.clinicalDescription}>
            {t('profile:correctionDescription')}
          </ThemedText>
          <Button
            title={t('profile:configureRanges')}
            onPress={() => openSchemaModal('correction')}
            variant="outlined"
            style={styles.inlineButton}
          />
          <ThemedText type="defaultSemiBold" style={styles.clinicalSubheading}>
            {t('profile:basal')}
          </ThemedText>
          <ThemedText muted style={styles.clinicalDescription}>
            {t('profile:basalDescription')}
          </ThemedText>
          <Button
            title={t('profile:configureSchema')}
            onPress={() => openSchemaModal('basal')}
            variant="outlined"
            style={styles.inlineButton}
          />
        </Card>

        {isGuestMode ? (
          <Card style={styles.card}>
            <ThemedText type="defaultSemiBold">{t('auth:guestAccountTitle')}</ThemedText>
            <ThemedText muted style={styles.clinicalDescription}>{t('auth:guestAccountDescription')}</ThemedText>
            <Button title={t('auth:login')} onPress={() => router.push('/auth/login')} />
            <View style={styles.buttonGap} />
            <Button title={t('auth:register')} onPress={() => router.push('/auth/register')} variant="outlined" />
          </Card>
        ) : (
          <>
            {guestProfile && (
              <Card style={styles.card}>
                <ThemedText type="defaultSemiBold">{t('auth:guestImportTitle')}</ThemedText>
                <ThemedText muted style={styles.clinicalDescription}>{t('auth:guestImportLater')}</ThemedText>
                <Button
                  title={t('auth:guestImportNow')}
                  onPress={async () => {
                    try {
                      await setPendingImport(true);
                      router.push('/auth/import-guest');
                    } catch (error) {
                      console.error('No se pudo reanudar la importación invitada:', error);
                      showErrorAlert(t('auth:guestImportError'));
                    }
                  }}
                />
              </Card>
            )}
            <Card style={styles.card}>
              <Button title={t('profile:logout')} onPress={handleLogout} variant="outlined" color="secondary" />
              <View style={styles.buttonGap} />
              <Button title={t('profile:deleteAccount')} onPress={handleDeleteAccount} variant="outlined" color="danger" />
            </Card>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <ContactModal
        visible={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setEditingContact(null);
        }}
        form={contactForm}
        onChange={setContactForm}
        onSave={handleSaveContact}
        editing={Boolean(editingContact)}
      />

      <Modal visible={schemaModal !== null} onClose={() => setSchemaModal(null)}>
        <ThemedText type="h6" style={styles.schemaModalTitle}>
          {schemaModal === 'correction' ? t('profile:correctionTitle') : t('profile:basalTitle')}
        </ThemedText>
        {schemaModal === 'correction' ? (
          <View style={styles.schemaInputRow}>
            <View style={styles.schemaInput}>
              <FormInput
                label={t('profile:min')}
                value={schemaForm.rangeMin}
                onChangeText={(rangeMin) => setSchemaForm((previous) => ({ ...previous, rangeMin }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.schemaInput}>
              <FormInput
                label={t('profile:max')}
                value={schemaForm.rangeMax}
                onChangeText={(rangeMax) => setSchemaForm((previous) => ({ ...previous, rangeMax }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        ) : (
          <DatePickerField
            label={t('profile:injectionTime')}
            mode="time"
            value={getTimeDate(schemaForm.injectionTime)}
            onChange={(date) => setSchemaForm((previous) => ({
              ...previous,
              injectionTime: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
            }))}
          />
        )}
        <FormInput
          label={t('profile:dose')}
          value={schemaForm.dose}
          onChangeText={(dose) => setSchemaForm((previous) => ({ ...previous, dose }))}
          keyboardType="numeric"
        />
        <Button
          title={editingSchemaIndex === null ? t('profile:addItem') : t('common:update')}
          onPress={addSchemaItem}
          variant="outlined"
          style={styles.schemaAddButton}
        />
        <ScrollView style={styles.schemaList} keyboardShouldPersistTaps="handled">
          {schemaModal === 'correction'
            ? correctionSchemas.map((item, index) => renderSchemaRow(
              `${item.rangeMin} - ${item.rangeMax} mg/dL → ${item.dose} UI`,
              index,
            ))
            : basalSchemas.map((item, index) => renderSchemaRow(
              `${item.injectionTime} → ${item.dose} UI`,
              index,
            ))}
          {(schemaModal === 'correction' ? correctionSchemas : basalSchemas).length === 0 && (
            <ThemedText muted style={styles.schemaEmpty}>
              {t('profile:noConfigurations')}
            </ThemedText>
          )}
        </ScrollView>
        <Button
          title={t('profile:saveConfiguration')}
          onPress={handleSaveSchemas}
          loading={savingPreferences}
          style={styles.schemaSaveButton}
        />
      </Modal>

      <Modal visible={showAvatarModal} onClose={() => setShowAvatarModal(false)}>
        <ThemedText type="h6" style={styles.avatarModalTitle}>
          {t('profile:chooseAvatar')}
        </ThemedText>
        <ScrollView
          contentContainerStyle={styles.avatarGrid}
          showsVerticalScrollIndicator={false}
        >
          {AVATAR_NAMES.map((avatarName) => {
            const isSelected = selectedAvatar === avatarName;

            return (
              <TouchableOpacity
                key={avatarName}
                style={[
                  styles.avatarOption,
                  {
                    borderColor: isSelected ? colors.primary.main : colors.divider,
                    backgroundColor: isSelected ? colors.primary[50] : colors.background.paper,
                  },
                ]}
                onPress={() => setSelectedAvatar(avatarName)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Elegir avatar ${avatarName}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Image
                  source={AVATARS[avatarName]}
                  style={styles.avatarOptionImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.avatarActions}>
          <Button
            title={t('common:cancel')}
            variant="outlined"
            color="secondary"
            onPress={() => setShowAvatarModal(false)}
            disabled={savingAvatar}
            style={styles.avatarActionButton}
          />
          <Button
            title={t('common:save')}
            onPress={handleSaveAvatar}
            loading={savingAvatar}
            style={styles.avatarActionButton}
          />
        </View>
      </Modal>
    </ThemedView>
  );
}

type ContactForm = { name: string; parentesco: string; telefono: string };

function ContactModal({
  visible,
  onClose,
  form,
  onChange,
  onSave,
  editing,
}: {
  visible: boolean;
  onClose: () => void;
  form: ContactForm;
  onChange: (form: ContactForm) => void;
  onSave: () => void;
  editing: boolean;
}) {
  const { t } = useTranslation(['profile', 'common', 'auth']);
  const { colors } = useTheme();
  return (
    <Modal visible={visible} onClose={onClose}>
      <ThemedText type="h6" style={{ marginBottom: 20 }}>
        {editing ? t('profile:editContact') : t('profile:newContact')}
      </ThemedText>
      <FormInput
        label={t('profile:contactName')}
        value={form.name}
        onChangeText={(value) => onChange({ ...form, name: value })}
        placeholder={t('profile:contactNamePlaceholder')}
        autoCapitalize="words"
      />
      <ThemedText muted style={styles.sexLabel}>{t('profile:relationship')}</ThemedText>
      <View style={styles.sexOptions}>
        {CONTACT_RELATIONSHIPS.map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => onChange({ ...form, parentesco: value })}
            style={[
              styles.sexOption,
              {
                borderColor: form.parentesco === value ? colors.primary.main : colors.border,
                backgroundColor: form.parentesco === value ? colors.primary[50] : colors.background.paper,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: form.parentesco === value }}
          >
            <ThemedText>{t(`auth:contact${value[0].toUpperCase()}${value.slice(1)}`)}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <FormInput
        label={t('profile:phone')}
        value={form.telefono}
        onChangeText={(value) => onChange({ ...form, telefono: value })}
        placeholder={t('profile:phonePlaceholder')}
        keyboardType="phone-pad"
      />
      <Button title={editing ? t('common:update') : t('common:save')} onPress={onSave} style={styles.inlineButton} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { paddingHorizontal: 16, paddingBottom: 8 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    marginBottom: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarEdit: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  changeAvatarText: { marginBottom: 4, fontSize: 12 },
  avatarModalTitle: { textAlign: 'center', marginBottom: 16 },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 16,
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  avatarOptionImage: { width: '100%', height: '100%' },
  avatarActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  avatarActionButton: { flex: 1, paddingHorizontal: 8 },
  userName: { marginTop: 8 },
  card: { padding: 20, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { marginLeft: 8, fontSize: 16 },
  appearanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appearanceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  appearanceText: { marginLeft: 12, flex: 1 },
  appearanceHint: { fontSize: 12 },
  systemThemeButton: { marginTop: 12, alignSelf: 'flex-start' },
  contactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactContent: { flex: 1 },
  contactDetail: { fontSize: 12 },
  editIcon: { marginRight: 12 },
  emptyMessage: { marginTop: 8, textAlign: 'center' },
  prefRow: { flexDirection: 'row' },
  prefField: { flex: 1 },
  prefGap: { width: 12 },
  sexLabel: { fontSize: 14, marginBottom: 8 },
  sexOptions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sexOption: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1.5, borderRadius: 10 },
  clinicalSubheading: { marginTop: 16, marginBottom: 4 },
  clinicalDescription: { fontSize: 13, marginBottom: 8 },
  schemaModalTitle: { textAlign: 'center', marginBottom: 16 },
  schemaInputRow: { flexDirection: 'row', gap: 12 },
  schemaInput: { flex: 1 },
  schemaAddButton: { marginBottom: 8 },
  schemaList: { maxHeight: 180 },
  schemaItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  schemaItemText: { flex: 1, fontSize: 13 },
  schemaEmpty: { textAlign: 'center', paddingVertical: 20 },
  schemaSaveButton: { marginTop: 12 },
  inlineButton: { marginTop: 8 },
  buttonGap: { height: 12 },
});

function getTimeDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}
