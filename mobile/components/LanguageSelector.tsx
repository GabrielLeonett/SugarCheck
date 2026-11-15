import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Asset } from 'expo-asset';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { APP_LANGUAGES, changeAppLanguage, type AppLanguage } from '@/src/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import { showErrorAlert } from '@/src/stores/systemAlertStore';

const LANGUAGE_FLAGS: Record<AppLanguage, number> = {
  es: require('../assets/icons/ES.svg'),
  en: require('../assets/icons/EN-US.svg'),
  pt: require('../assets/icons/PT.svg'),
  ja: require('../assets/icons/JA.svg'),
};

export function LanguageSelector() {
  const { i18n, t } = useTranslation('common');
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
  const selectedLanguage = APP_LANGUAGES.find(({ code }) => code === currentLanguage) ?? APP_LANGUAGES[0];

  const selectLanguage = async (language: AppLanguage) => {
    try {
      await changeAppLanguage(language);
      setIsExpanded(false);
    } catch (error) {
      console.error('No se pudo guardar el idioma seleccionado:', error);
      showErrorAlert(t('languageSaveError'));
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background.paper }]}
        onPress={() => setIsExpanded((expanded) => !expanded)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={t('language')}
      >
        <Flag language={selectedLanguage.code} />
        <Text style={[styles.languageName, { color: colors.text.primary }]}>
          {t('language')}
        </Text>
        <Text style={[styles.selectedLanguage, { color: colors.text.disabled }]}>
          {selectedLanguage.name}
        </Text>
        <FontAwesome
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.text.disabled}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.options, { borderColor: colors.border, backgroundColor: colors.background.paper }]}>
          {APP_LANGUAGES.map((language) => {
            const selected = currentLanguage === language.code;
            return (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.option,
                  selected && { backgroundColor: colors.primary[50] },
                ]}
                onPress={() => selectLanguage(language.code)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={language.name}
              >
                <Flag language={language.code} />
                <Text style={[styles.languageName, { color: colors.text.primary }]}>
                  {language.name}
                </Text>
                {selected && <FontAwesome name="check" size={16} color={colors.primary.main} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

function Flag({ language }: { language: AppLanguage }) {
  const asset = Asset.fromModule(LANGUAGE_FLAGS[language]);
  return <SvgUri width={28} height={20} uri={asset.uri} />;
}

const styles = StyleSheet.create({
  selector: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  languageName: { flex: 1, fontSize: 15 },
  selectedLanguage: { fontSize: 14 },
  options: { marginTop: 6, borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
});
