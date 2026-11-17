// src/config/firebase.ts
//
// Configuración de Firebase Auth para iOS/Android. En web se usa
// `firebase.web.ts`, porque `getReactNativePersistence` solo está disponible
// en la build de React Native de `@firebase/auth`.
import { initializeAuth } from 'firebase/auth';
// `getReactNativePersistence` sí existe en la build de React Native que Metro
// resuelve en runtime; TypeScript, en cambio, resuelve los tipos de la build
// web (`auth-public.d.ts`), que no lo exporta. Por eso se suprime el error.
// @ts-expect-error — el miembro solo falta en los tipos web de @firebase/auth
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from './firebaseConfig';

export const authFirebase = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
