import type { ImageSourcePropType } from 'react-native';

export const AVATARS: Record<string, ImageSourcePropType> = {
  GlucoAstro: require('../assets/profile/GlucoAstro.png'),
  GlucoBeisbol: require('../assets/profile/GlucoBeisbol.png'),
  GlucoBombero: require('../assets/profile/GlucoBombero.png'),
  GlucoFutbolista: require('../assets/profile/GlucoFutbolista.png'),
  GlucoInformatico: require('../assets/profile/GlucoInformatico.png'),
  GlucoMedico: require('../assets/profile/GlucoMedico.png'),
  GlucoPintor: require('../assets/profile/GlucoPintor.png'),
  GlucoPolicia: require('../assets/profile/GlucoPolicia.png'),
  GlucoMago: require('../assets/profile/GucloMago.png'),
};

export const AVATAR_NAMES = Object.keys(AVATARS);
