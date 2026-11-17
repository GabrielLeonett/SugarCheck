import { initializeApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: 'AIzaSyDjyaPhgspD4aHAPcRoozGLDdyjv7G0dNU',
  authDomain: 'guerrerosazueles.firebaseapp.com',
  projectId: 'guerrerosazueles',
  storageBucket: 'guerrerosazueles.firebasestorage.app',
  messagingSenderId: '919291920279',
  appId: '1:919291920279:web:1b505d0cc459cf0cfb4ed2',
  measurementId: 'G-E6LSETM4ZX',
};

export const app = initializeApp(firebaseConfig);
