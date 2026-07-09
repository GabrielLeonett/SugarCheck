import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/card';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useAuthStore } from '@/src/stores/authStore';
import { userApi } from '@/src/apis/user';
import { contactEmergenceApi } from '@/src/apis/contact-emergence';
import type { ContactEmergenceData } from '@/src/types';
import { usePreferenceConfig } from '@/src/stores/preferenceStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function PerfilScreen() {
  const colorScheme = useColorScheme() ?? 'light';
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
    breakfast: preference?.insulinRatios?.breakfast?.toString() || '1',
    lunch: preference?.insulinRatios?.lunch?.toString() || '1',
    dinner: preference?.insulinRatios?.dinner?.toString() || '1',
    sensitivity: preference?.sensitivity?.toString() || '1',
  });

  useEffect(() => {
    loadContacts();
    loadPrefs();
  }, []);

  useEffect(() => {
    if (preference) {
      setPrefForm({
        hypo: preference.thresholds?.hypo?.toString() || '70',
        hiper: preference.thresholds?.hiper?.toString() || '180',
        breakfast: preference.insulinRatios?.breakfast?.toString() || '1',
        lunch: preference.insulinRatios?.lunch?.toString() || '1',
        dinner: preference.insulinRatios?.dinner?.toString() || '1',
        sensitivity: preference.sensitivity?.toString() || '1',
      });
    }
  }, [preference]);

  const loadContacts = async () => {
    try {
      const data = await contactEmergenceApi.getAll();
      setContacts(Array.isArray(data) ? data : []);
    } catch {
      setContacts([]);
    }
  };

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
      { text: 'Cerrar sesión', onPress: () => logout() },
    ]);
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionHeader}>
      <FontAwesome name={icon as any} size={18} color={Colors[colorScheme].tint} />
      <ThemedText type="defaultSemiBold" style={{ marginLeft: 8, fontSize: 16 }}>{title}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerTitle}>
        <ThemedText type="title" style={{ fontSize: 24 }}>Perfil</ThemedText>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: Colors[colorScheme].tint }]}>
            <FontAwesome name="user" size={40} color="#fff" />
          </View>
          <ThemedText type="title" style={{ fontSize: 20, marginTop: 8 }}>{authUser?.name}</ThemedText>
          <ThemedText style={{ opacity: 0.6 }}>{authUser?.email}</ThemedText>
        </View>

        <Card style={styles.card}>
          <SectionHeader title="Información personal" icon="user" />
          <FormInput label="Nombre" value={personalData.name} onChangeText={(v) => setPersonalData((p) => ({ ...p, name: v }))} />
          <FormInput label="Correo electrónico" value={personalData.email} onChangeText={(v) => setPersonalData((p) => ({ ...p, email: v }))} keyboardType="email-address" />
          <FormInput label="Sexo" value={personalData.sexo} onChangeText={(v) => setPersonalData((p) => ({ ...p, sexo: v }))} />
          <Button title="Guardar cambios" onPress={handleSavePersonal} style={{ marginTop: 8 }} />
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
            >
              <FontAwesome name="plus-circle" size={24} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </View>
          {contacts.length === 0 ? (
            <ThemedText style={{ opacity: 0.5, marginTop: 8, textAlign: 'center' }}>
              No hay contactos de emergencia
            </ThemedText>
          ) : (
            contacts.map((c) => (
              <View key={c.id} style={styles.contactItem}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{c.name}</ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>{c.parentesco}{c.telefono ? ` - ${c.telefono}` : ''}</ThemedText>
                </View>
                <TouchableOpacity onPress={() => { setEditingContact(c); setContactForm({ name: c.name, parentesco: c.parentesco, telefono: c.telefono || '' }); setShowContactModal(true); }}>
                  <FontAwesome name="edit" size={18} color={Colors[colorScheme].tint} style={{ marginRight: 12 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteContact(c.id)}>
                  <FontAwesome name="trash" size={18} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Parámetros clínicos" icon="heartbeat" />
          <View style={styles.prefRow}>
            <FormInput label="Límite hipoglucemia" value={prefForm.hypo} onChangeText={(v) => setPrefForm((p) => ({ ...p, hypo: v }))} keyboardType="numeric" />
            <View style={{ width: 12 }} />
            <FormInput label="Límite hiperglucemia" value={prefForm.hiper} onChangeText={(v) => setPrefForm((p) => ({ ...p, hiper: v }))} keyboardType="numeric" />
          </View>
          <FormInput label="Sensibilidad a la insulina" value={prefForm.sensitivity} onChangeText={(v) => setPrefForm((p) => ({ ...p, sensitivity: v }))} keyboardType="numeric" />
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>Ratio insulina/raciones</ThemedText>
          <View style={styles.prefRow}>
            <FormInput label="Desayuno" value={prefForm.breakfast} onChangeText={(v) => setPrefForm((p) => ({ ...p, breakfast: v }))} keyboardType="numeric" />
            <View style={{ width: 12 }} />
            <FormInput label="Almuerzo" value={prefForm.lunch} onChangeText={(v) => setPrefForm((p) => ({ ...p, lunch: v }))} keyboardType="numeric" />
            <View style={{ width: 12 }} />
            <FormInput label="Cena" value={prefForm.dinner} onChangeText={(v) => setPrefForm((p) => ({ ...p, dinner: v }))} keyboardType="numeric" />
          </View>
        </Card>

        <Card style={styles.card}>
          <Button title="Cerrar sesión" onPress={handleLogout} variant="outlined" color="secondary" />
          <View style={{ height: 12 }} />
          <Button title="Eliminar cuenta" onPress={handleDeleteAccount} variant="outlined" color="danger" />
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ContactModal
        visible={showContactModal}
        onClose={() => { setShowContactModal(false); setEditingContact(null); }}
        form={contactForm}
        onChange={setContactForm}
        onSave={handleSaveContact}
        editing={!!editingContact}
      />
    </ThemedView>
  );
}

function ContactModal({
  visible, onClose, form, onChange, onSave, editing,
}: {
  visible: boolean; onClose: () => void; form: { name: string; parentesco: string; telefono: string };
  onChange: (f: typeof form) => void; onSave: () => void; editing: boolean;
}) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <ThemedText type="title" style={{ fontSize: 20, marginBottom: 20 }}>
        {editing ? 'Editar contacto' : 'Nuevo contacto'}
      </ThemedText>
      <FormInput label="Nombre" value={form.name} onChangeText={(v) => onChange({ ...form, name: v })} placeholder="Nombre del contacto" />
      <FormInput label="Parentesco" value={form.parentesco} onChangeText={(v) => onChange({ ...form, parentesco: v })} placeholder="madre, padre, tutor, otro" />
      <FormInput label="Teléfono" value={form.telefono} onChangeText={(v) => onChange({ ...form, telefono: v })} placeholder="+58 412..." keyboardType="phone-pad" />
      <Button title={editing ? 'Actualizar' : 'Guardar'} onPress={onSave} style={{ marginTop: 16 }} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 20, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  contactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  prefRow: { flexDirection: 'row' },
});
