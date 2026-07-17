type ImcNotifLang = Record<string, string>;
type ImcNotifTranslations = Record<string, ImcNotifLang>;

export const IMC_NOTIFICATIONS: ImcNotifTranslations = {
  es: {
    creationTitle: 'Nuevo registro de IMC',
    creationMessage: 'Has registrado un nuevo IMC de {value} - {category}',
    reminderTitle: 'Recordatorio de IMC',
    reminderMessage: 'No has registrado tu peso hoy. Mant\u00e9n tu bit\u00e1cora al d\u00eda.',
  },
  en: {
    creationTitle: 'New BMI record',
    creationMessage: 'You registered a new BMI of {value} - {category}',
    reminderTitle: 'BMI reminder',
    reminderMessage: 'You haven\u2019t recorded your weight today. Keep your log up to date.',
  },
  pt: {
    creationTitle: 'Novo registro de IMC',
    creationMessage: 'Voc\u00ea registrou um novo IMC de {value} - {category}',
    reminderTitle: 'Lembrete de IMC',
    reminderMessage: 'Voc\u00ea n\u00e3o registrou seu peso hoje. Mantenha seu di\u00e1rio atualizado.',
  },
  ja: {
    creationTitle: '\u65b0\u3057\u3044BMI\u8a18\u9332',
    creationMessage: '\u65b0\u3057\u3044BMI {value} - {category} \u3092\u8a18\u9332\u3057\u307e\u3057\u305f',
    reminderTitle: 'BMI\u30ea\u30de\u30a4\u30f3\u30c0\u30fc',
    reminderMessage: '\u4eca\u65e5\u306e\u4f53\u91cd\u304c\u307e\u3060\u8a18\u9332\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002\u30ed\u30b0\u3092\u66f4\u65b0\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
  },
};

export function getImcNotifText(lang: string | undefined, key: string, replacements?: Record<string, string>): string {
  const txt = IMC_NOTIFICATIONS[lang ?? 'es'] || IMC_NOTIFICATIONS.es;
  let msg = txt[key] ?? txt[key];
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      msg = msg.replace(`{${k}}`, v);
    }
  }
  return msg;
}
