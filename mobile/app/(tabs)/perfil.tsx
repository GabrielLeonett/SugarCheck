import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/card';
import { FormInput } from '@/components/FormInput';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/src/stores/authStore';
import { userApi } from '@/src/apis/user';
import { contactEmergenceApi } from '@/src/apis/contact-emergence';
import type { ContactEmergenceData } from '@/src/types';
import { usePreferenceConfig } from '@/src/stores/preferenceStore';

export default function PerfilScreen() {
  const { colors, isDark, mode, toggleTheme, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { preference, load: loadPrefs } = usePreferenceConfig();

  const [contacts, setContacts] = useState<ContactEmergenceData[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactEmergenceData | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', parentesco: '', telefono: '' });
  const [personalData, setPersonalData] = useState({
    name: authUser?.name || '',
    email: authUser?.email || '',
    sexo: authUser?.sexo || '',
  });

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
      setPrefForm({
        hypo: preference.thresholds?.hypo?.toString() || '70',
        hiper: preference.thresholds?.hiper?.toString() || '180',
      });
    }
  }, [preference]);

  const handleSavePersonal = async () => {
    if (!authUser?.id) return;
    try {
      await userApi.update(authUser.id, personalData);
      Alert.alert('Guardado', 'Datos actualizados correctamente');
    } catch {
      Alert.alert('Error', 'No se pudieron actualizar los datos');
    }
  };

  const handleSaveContact = async () => {
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
      Alert.alert('Error', 'No se pudo guardar el contacto');
    }
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert('Eliminar contacto', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await contactEmergenceApi.delete(id);
            loadContacts();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el contacto');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (authUser?.id) await userApi.delete(authUser.id);
              await logout();
              router.push('/auth/login');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la cuenta');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        onPress: async () => {
          try {
            await logout();
            router.push('/auth/login');
          } catch {
            Alert.alert('Error', 'No se pudo cerrar la sesión');
          }
        },
      },
    ]);
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
          Perfil
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary.main }]}>
            <FontAwesome name="user" size={40} color={colors.primary.contrastText} />
          </View>
          <ThemedText type="h6" style={styles.userName}>
            {authUser?.name}
          </ThemedText>
          <ThemedText muted>{authUser?.email}</ThemedText>
        </View>

        <Card style={styles.card}>
          <SectionHeader title="Apariencia" icon="adjust" />
          <View style={styles.appearanceRow}>
            <View style={styles.appearanceInfo}>
              <FontAwesome
                name={isDark ? 'moon-o' : 'sun-o'}
                size={20}
                color={colors.primary.main}
              />
              <View style={styles.appearanceText}>
                <ThemedText type="defaultSemiBold">
                  {isDark ? 'Tema oscuro' : 'Tema claro'}
                </ThemedText>
                <ThemedText muted style={styles.appearanceHint}>
                  {mode === 'system' ? 'Siguiendo el sistema' : 'Preferencia guardada'}
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
                Usar tema del sistema
              </ThemedText>
            </TouchableOpacity>
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Información personal" icon="user" />
          <FormInput
            label="Nombre"
            value={personalData.name}
            onChangeText={(value) => setPersonalData((previous) => ({ ...previous, name: value }))}
            autoCapitalize="words"
          />
          <FormInput
            label="Correo electrónico"
            value={personalData.email}
            onChangeText={(value) => setPersonalData((previous) => ({ ...previous, email: value }))}
            keyboardType="email-address"
          />
          <FormInput
            label="Sexo"
            value={personalData.sexo}
            onChangeText={(value) => setPersonalData((previous) => ({ ...previous, sexo: value }))}
          />
          <Button title="Guardar cambios" onPress={handleSavePersonal} style={styles.inlineButton} />
        </Card>

        <Card style={styles.card}>
          <View style={styles.contactHeader}>
            <SectionHeader title="Contactos de emergencia" icon="phone" />
            <TouchableOpacity
              onPress={() => {
                setEditingContact(null);
                setContactForm({ name: '', parentesco: '', telefono: '' });
                setShowContactModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Agregar contacto de emergencia"
            >
              <FontAwesome name="plus-circle" size={24} color={colors.primary.main} />
            </TouchableOpacity>
          </View>

          {contacts.length === 0 ? (
            <ThemedText muted style={styles.emptyMessage}>
              No hay contactos de emergencia
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
                  accessibilityLabel="Editar contacto"
                >
                  <FontAwesome
                    name="edit"
                    size={18}
                    color={colors.primary.main}
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteContact(contact.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Eliminar contacto"
                >
                  <FontAwesome name="trash" size={18} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Parámetros clínicos" icon="heartbeat" />
          <View style={styles.prefRow}>
            <View style={styles.prefField}>
              <FormInput
                label="Límite hipoglucemia"
                value={prefForm.hypo}
                onChangeText={(value) => setPrefForm((previous) => ({ ...previous, hypo: value }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.prefGap} />
            <View style={styles.prefField}>
              <FormInput
                label="Límite hiperglucemia"
                value={prefForm.hiper}
                onChangeText={(value) => setPrefForm((previous) => ({ ...previous, hiper: value }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Button title="Cerrar sesión" onPress={handleLogout} variant="outlined" color="secondary" />
          <View style={styles.buttonGap} />
          <Button title="Eliminar cuenta" onPress={handleDeleteAccount} variant="outlined" color="danger" />
        </Card>

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
  return (
    <Modal visible={visible} onClose={onClose}>
      <ThemedText type="h6" style={{ marginBottom: 20 }}>
        {editing ? 'Editar contacto' : 'Nuevo contacto'}
      </ThemedText>
      <FormInput
        label="Nombre"
        value={form.name}
        onChangeText={(value) => onChange({ ...form, name: value })}
        placeholder="Nombre del contacto"
        autoCapitalize="words"
      />
      <FormInput
        label="Parentesco"
        value={form.parentesco}
        onChangeText={(value) => onChange({ ...form, parentesco: value })}
        placeholder="madre, padre, tutor, otro"
      />
      <FormInput
        label="Teléfono"
        value={form.telefono}
        onChangeText={(value) => onChange({ ...form, telefono: value })}
        placeholder="+58 412..."
        keyboardType="phone-pad"
      />
      <Button title={editing ? 'Actualizar' : 'Guardar'} onPress={onSave} style={styles.inlineButton} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  inlineButton: { marginTop: 8 },
  buttonGap: { height: 12 },
});
