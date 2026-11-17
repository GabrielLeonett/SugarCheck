// src/config/firebase.web.ts
//
// Configuración de Firebase Auth para web. La build web de `@firebase/auth`
// no exporta `getReactNativePersistence`, así que usamos `getAuth` con la
// persistencia por defecto del navegador (local).
import { getAuth } from 'firebase/auth';
import { app } from './firebaseConfig';

export const authFirebase = getAuth(app);
